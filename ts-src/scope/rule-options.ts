import {_mergeLogicalConditionOptions, LogicalConditionOptions} from '@franzzemen/re-logical-condition';

export interface RuleOptions extends LogicalConditionOptions {

}

export function _mergeRuleOptions(target: RuleOptions, source: RuleOptions, mergeInto = false): RuleOptions {
  return _mergeLogicalConditionOptions(target, source, mergeInto);
}
