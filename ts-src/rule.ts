import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {isPromise, Scope} from '@franzzemen/re-common';
import {LogicalConditionGroup} from '@franzzemen/re-logical-condition';
import {RuleParser} from './parser/rule-parser';
import {RuleReference, Version} from './rule-reference';
import {RuleOptions} from './scope/rule-options';
import {RuleScope} from './scope/rule-scope';

export interface RuleResult {
  valid: boolean;
  ruleRef: string;
  ruleText: string;
}


export function isRule(rule: RuleReference | Rule): rule is Rule {
  return 'scope' in rule  && 'awaitExecution' in rule;
}

export function possiblyARuleConstruct(text: string): boolean {
  // A rule construct name is either a uuid v4 or an alphanumeric name (with simple spaces allowed).
  // Check for alphanumeric
  if(/^[a-zA-Z ]*$/.test(text) === true) {
    return false;
  }
  // Check uuidv4
  return !(/^[a-zA-Z ]*$/.test(text) || /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/.test(text));
}

export class Rule {
  refName: string;
  version: Version = {major: 1.0, minor: 0.0, patch: 0.0};
  options: RuleOptions = {};
  scope: RuleScope;
  logicalConditionGroup: LogicalConditionGroup;

  constructor(rule?: RuleReference | Rule, parentScope?: Scope, ec?: ExecutionContextI) {
    if(rule) {
      Rule.fromToInstance(this, rule, parentScope, ec);
    }
  }

  to(ec?:ExecutionContextI): RuleReference {
    const ruleRef:Partial<RuleReference> = {};
    ruleRef.version = this.version;  // TODO:  Copy instead
    ruleRef.options = this.options; // TODO: Copy instead
    ruleRef.refName = this.refName;
    ruleRef.logicalConditionRef = this.logicalConditionGroup.to(ec);
    return ruleRef as RuleReference;
  }

  static from(ruleRef: RuleReference | Rule, parentScope?: Scope, ec?: ExecutionContextI): Rule {
    return new Rule(ruleRef, parentScope, ec);
  }

  private static fromToInstance(instance: Rule, ruleRef: RuleReference | Rule, parentScope?: Scope, ec?: ExecutionContextI) {
    if(isRule(ruleRef)) {
      Rule.fromCopy(instance, ruleRef, parentScope, ec);
    } else {
      Rule.fromReference(instance, ruleRef, parentScope, ec);
    }
  }


  private static fromReference(instance: Rule, ruleRef: RuleReference, parentScope?: Scope, ec?:ExecutionContextI) {
    const ruleScope = new RuleScope(ruleRef.options, parentScope, ec);
    instance.scope = ruleScope;
    // TODO: Deep copy?
    instance.options = ruleRef.options;
    instance.refName = ruleRef.refName;
    // TODO:  Deep copy?
    instance.version = ruleRef.version;
    instance.logicalConditionGroup = LogicalConditionGroup.from(ruleRef.logicalConditionRef, instance.scope, ec);
  }

  private static fromCopy(instance: Rule, rule: Rule, parentScope?: Scope, ec?: ExecutionContextI) {
    instance.scope = new RuleScope(rule.options, parentScope, ec);
    // TODO: Deep copy?
    instance.options = rule.options;
    instance.refName = rule.refName;
    // TODO:  Deep copy?
    instance.version = rule.version;
    instance.logicalConditionGroup = LogicalConditionGroup.from(rule.logicalConditionGroup, instance.scope, ec);
  }

  /**
   * @deprecated
   * @param dataDomain
   * @param ec
   */
  awaitValidation(dataDomain: any, ec?: ExecutionContextI): RuleResult | Promise<RuleResult> {
    const log = new LoggerAdapter(ec, 'rules-engine', 'rule', 'Rule.awaitValidation');
    const logicalConditionResult = this.logicalConditionGroup.validate(dataDomain, this.scope, ec);
    if(isPromise(logicalConditionResult)) {
      return logicalConditionResult.then(result => {
        return {ruleRef: this.refName, ruleText: '', valid: result.result};
      });
    } else {
      return {ruleRef: this.refName, ruleText: '', valid: logicalConditionResult.result};
    }
  }

  awaitExecution(dataDomain: any, ec?: ExecutionContextI): RuleResult | Promise<RuleResult> {
    return this.awaitValidation(dataDomain, ec);
  }

  /**
   * The synchronous version of awaitExecution
   * @param dataDomain
   * @param ec
   */
  executeSync(dataDomain: any, ec?: ExecutionContextI): RuleResult {
    const result = this.awaitExecution(dataDomain, ec);
    if(isPromise(result)) {
      const log = new LoggerAdapter(ec, 'rules-engine', 'rules', 'executeSync');
      const err = new Error('Promise returned in executeSync');
      log.error(err);
      throw(err);
    } else {
      return result;
    }
  }

  /**
   * Executes a rule, whether part of the Rules Engine schema or not.
   * @param dataDomain
   * @param rule Either the rule in Text Format, Reference Format or Internal Format
   * @param parentScope Instruct the method to use the parent scope, for example if one wants to use the Rules.Engine scope.  Set to undefined by default.
   * @param ec
   */
  static awaitRuleExecution(dataDomain: any, rule: string | RuleReference | Rule, parentScope?: Scope, ec?: ExecutionContextI): RuleResult | Promise<RuleResult> {
    let theRule: Rule;
    if(typeof rule === 'string') {
      const parser = new RuleParser();
      let [remaining, ref] = parser.parse(rule, parentScope, ec);
      theRule = new Rule(ref, parentScope, ec);
    } else if(isRule(rule)) {
      theRule = rule;
    } else {
      theRule = new Rule(rule, parentScope, ec);
    }
    return theRule.awaitExecution(dataDomain, ec);
  }

  /**
   * The synchronous version of awaitRuleExecution
   * @param dataDomain
   * @param rule
   * @param parentScope
   * @param ec
   */
  static executeRuleSync(dataDomain: any, rule: string | RuleReference | Rule, parentScope?: Scope, ec?: ExecutionContextI): RuleResult {
    let theRule: Rule;
    if(typeof rule === 'string') {
      const parser = new RuleParser();
      let [remaining, ref] = parser.parse(rule, parentScope, ec);
      theRule = new Rule(ref, parentScope, ec);
    } else if(isRule(rule))  {
      theRule = rule;
    } else {
      theRule = new Rule(rule, parentScope, ec);
    }
    return theRule.executeSync(dataDomain, ec);
  }
}

