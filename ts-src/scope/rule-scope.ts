import {ExecutionContextI} from '@franzzemen/app-utility';
import {Scope} from '@franzzemen/re-common';
import {LogicalConditionScope} from '@franzzemen/re-logical-condition';
import {RuleOptions} from './rule-options';

export class RuleScope extends LogicalConditionScope {
  public static ParentScope = 'ParentScope';
  constructor(options?: RuleOptions, parentScope?: Scope, ec?: ExecutionContextI) {
    super(options, parentScope, ec);
  }
}
