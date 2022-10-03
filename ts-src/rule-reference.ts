import {NamedReference} from '@franzzemen/re-common';
import {LogicalConditionGroupReference} from '@franzzemen/re-logical-condition';
import {RuleOptions} from './scope/rule-options.js';

export type Version = {major: number, minor: number, patch: number};

export interface RuleReference extends NamedReference {
  version: Version;
  options: RuleOptions;
  logicalConditionRef: LogicalConditionGroupReference;
}
