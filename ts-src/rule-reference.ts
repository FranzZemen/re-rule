import {NamedReference} from '@franzzemen/re-common';
import {LogicalConditionGroupReference} from '@franzzemen/re-logical-condition';
import {RuleOptions} from './scope/rule-options.js';
import {RuleScope} from './scope/rule-scope.js';

export type Version = {major: number, minor: number, patch: number};


export interface ScopedEntity extends NamedReference {
  loadedScope?: RuleScope;  // Parser and scope load help
}

export interface RuleReference extends ScopedEntity {
  version: Version;
  options: RuleOptions;
  logicalConditionRef: LogicalConditionGroupReference;
}
