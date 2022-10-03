import {isPromise} from 'node:util/types';
import {ExecutionContextI, LoggerAdapter} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {LogicalConditionGroup} from '@franzzemen/re-logical-condition';
import {RuleParser} from './parser/rule-parser.js';
import {RuleReference, Version} from './rule-reference.js';
import {RuleOptions} from './scope/rule-options.js';
import {RuleScope} from './scope/rule-scope.js';

export interface RuleResult {
  valid: boolean;
  ruleRef: string;
  ruleText: string;
}


export function isRule(rule: RuleReference | Rule): rule is Rule {
  return rule instanceof Rule;
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

  // Remember that contained object may need scope.resolve() if their references contained unresolved items.
  constructor(ref: RuleReference, options?: RuleOptions, parentScope?:RuleScope, ec?: ExecutionContextI) {
    this.scope = new RuleScope(options, parentScope, ec);
    // TODO: Deep copy?
    this.options = ref.options;
    this.refName = ref.refName;
    // TODO:  Deep copy?
    this.version = ref.version;
    this.logicalConditionGroup = new LogicalConditionGroup(ref.logicalConditionRef, this.scope, ec);
  }


  awaitEvaluation(dataDomain: any, ec?: ExecutionContextI): RuleResult | Promise<RuleResult> {
    const log = new LoggerAdapter(ec, 're-rule', 'rule', 'Rule.awaitValidation');
    const logicalConditionResult = this.logicalConditionGroup.awaitEvaluation(dataDomain, this.scope, ec);
    if(isPromise(logicalConditionResult)) {
      return logicalConditionResult.then(result => {
        return {ruleRef: this.refName, ruleText: '', valid: result.result};
      });
    } else {
      return {ruleRef: this.refName, ruleText: '', valid: logicalConditionResult.result};
    }
  }
  

  /**
   * Executes a rule, whether part of the Rules Engine schema or not.
   * @param dataDomain
   * @param rule Either the rule in Text Format, Reference Format or Internal Format
   * @param options
   * @param parentScope Instruct the method to use the parent scope, for example if one wants to use the Rules.Engine scope.  Set to undefined by default.
   * @param ec
   */
  static awaitRuleExecution(dataDomain: any, rule: string | RuleReference | Rule, options?: RuleOptions, parentScope?: RuleScope, ec?: ExecutionContextI): RuleResult | Promise<RuleResult> {
    let theRule: Rule;
    if(typeof rule === 'string') {
      const parser = new RuleParser();
      let [remaining, ref] = parser.parse(rule, parentScope, ec);
      theRule = new Rule(ref, options, parentScope, ec);
    } else if(isRule(rule)) {
      theRule = rule;
    } else {
      theRule = new Rule(rule, options, parentScope, ec);
    }
    return theRule.awaitEvaluation(dataDomain, ec);
  }

}

