import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {Scope} from '@franzzemen/re-common';
import {LogicalConditionScope} from '@franzzemen/re-logical-condition';
import {RuleParser} from '../parser/rule-parser.js';
import {ReRule} from './rule-execution-context.js';

export class RuleScope extends LogicalConditionScope {
  public static ParentScope = 'ParentScope';
  public static RuleParser = 'RuleParser';
  constructor(options?: ReRule, parentScope?: Scope, ec?: LogExecutionContext) {
    super(options, parentScope, ec);
    this.set(RuleScope.RuleParser, new RuleParser());
  }

  get options(): ReRule {
    return this._options;
  }
}
