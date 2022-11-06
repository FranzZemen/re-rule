import {logErrorAndThrow} from '@franzzemen/enhanced-error';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {isPromise} from 'node:util/types';
import {LogicalConditionGroup, LogicalConditionResult} from '@franzzemen/re-logical-condition';
import {RuleParser} from './parser/rule-parser.js';
import {RuleReference, Version} from './rule-reference.js';
import {ReRule} from './scope/rule-execution-context.js';
import {RuleScope} from './scope/rule-scope.js';

export interface RuleResultI {
  logicalConditionResult: LogicalConditionResult;
  ruleRef: string;
  ruleText: string;
}

export class RuleResult {
  protected _result: RuleResultI;

  constructor(_result: RuleResultI, ec?: LogExecutionContext) {
    this._result = _result;
  }

  get result (): RuleResultI {
    return this._result;
  }

  get valid(): boolean | 'Not resolved' {
    if(isPromise(this._result?.logicalConditionResult)) {
      return 'Not resolved';
    } else {
      return this._result.logicalConditionResult.result;
    }
  }
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
  scope: RuleScope;
  logicalConditionGroup: LogicalConditionGroup;

  /**
   *  Build a rule
   * @param ref
   * @param thisScope If provided (such as right after parsing a rule), then this is the scope to use, fully initialized with references
   * @param ec
   */
  constructor(ref: RuleReference, thisScope?: RuleScope, ec?: LogExecutionContext) {
    // Which scope?
    this.refName = ref.refName;
    this.scope = ref.loadedScope ? ref.loadedScope : thisScope ? thisScope : undefined;
    if(!this.scope) {
      logErrorAndThrow(`Scope not provided for refName ${ref.refName}`, new LoggerAdapter(ec, 're-rule', 'rule', 'constructor'));
    }
    this.version = ref.version;
    this.logicalConditionGroup = new LogicalConditionGroup(ref.logicalConditionRef, this.scope, ec);
  }


  awaitEvaluation(dataDomain: any, ec?: LogExecutionContext): RuleResult | Promise<RuleResult> {
    const log = new LoggerAdapter(ec, 're-rule', 'rule', 'Rule.awaitValidation');
    const logicalConditionResultOrPromise = this.logicalConditionGroup.awaitEvaluation(dataDomain, this.scope, ec);
    if(isPromise(logicalConditionResultOrPromise)) {
      return logicalConditionResultOrPromise
        .then(logicalConditionResult => {
          return new RuleResult({ruleRef: this.refName, ruleText: '', logicalConditionResult: logicalConditionResult});
        });
    } else {
      return new RuleResult({ruleRef: this.refName, ruleText: '', logicalConditionResult: logicalConditionResultOrPromise});
    }
  }


  /**
   * Executes a rule, but parses it first.
   * @param dataDomain
   * @param text The rule text.
   * @param options Options can be set here and in the text.  Text overrides any duplicate options
   * @param ec
   */
  static awaitExecution(dataDomain: any, text: string, options?: ReRule, ec?: LogExecutionContext): RuleResult | Promise<RuleResult> {
    const parser = new RuleParser();
    let [remaining, ref, parserMessages] = parser.parse(text, {options}, undefined, ec);
    let trueOrPromise = RuleScope.resolve(ref.loadedScope, ec);
    if(isPromise(trueOrPromise)) {
      return trueOrPromise
        .then(trueVal => {
          const rule: Rule = new Rule(ref, undefined, ec);
          return rule.awaitEvaluation(dataDomain, ec);
        })
    } else {
      const rule: Rule = new Rule(ref, undefined, ec);
      return rule.awaitEvaluation(dataDomain, ec);
    }
  }
}

