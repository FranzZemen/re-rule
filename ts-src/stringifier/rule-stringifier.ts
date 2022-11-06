import {LogExecutionContext} from '@franzzemen/logger-adapter';
import {LogicalConditionStringifier} from '@franzzemen/re-logical-condition';
import {RuleReference} from '../rule-reference.js';
import {RuleScope} from '../scope/rule-scope.js';
import {RuleHintKey} from '../util/rule-hint-key.js';
import {StringifyRuleOptions} from './stringify-rule-options.js';


export class RuleStringifier {
  constructor() {
  }

  stringify(ruleRef: RuleReference, scope: RuleScope, options?: StringifyRuleOptions, ec?: LogExecutionContext): string {
    let stringified;
    // TODO: stringify options
    if (ruleRef.refName.indexOf(' ') < 0) {
      stringified = `<<${RuleHintKey.Rule} ${RuleHintKey.Name}=${ruleRef.refName}>> `;
    } else {
      stringified = `<<${RuleHintKey.Rule} ${RuleHintKey.Name}="${ruleRef.refName}">> `;
    }
    const logicalConditionStringifier = new LogicalConditionStringifier();
    stringified += logicalConditionStringifier.stringify(ruleRef.logicalConditionRef, scope, options, ec, false);
    return stringified;
  }
}
