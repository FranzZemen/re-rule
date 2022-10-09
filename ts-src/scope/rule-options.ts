import {_mergeLogicalConditionOptions, LogicalConditionOptions} from '@franzzemen/re-logical-condition';

export interface RuleOptions extends LogicalConditionOptions {

}

export function _mergeRuleOptions(source: RuleOptions, target: RuleOptions, mergeInto = true): RuleOptions {
  return _mergeLogicalConditionOptions(source, target, mergeInto);
}
