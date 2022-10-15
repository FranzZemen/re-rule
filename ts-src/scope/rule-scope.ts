import {ExecutionContextI} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {LogicalConditionScope} from '@franzzemen/re-logical-condition';
import {RuleOptions} from './rule-options.js';
import {RuleParser} from '../parser/rule-parser.js';

export class RuleScope extends LogicalConditionScope {
  public static ParentScope = 'ParentScope';
  public static RuleParser = 'RuleParser';
  constructor(options?: RuleOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
    this.set(RuleScope.RuleParser, new RuleParser());
  }
}
