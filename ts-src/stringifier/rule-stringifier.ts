import {ExecutionContextI} from '@franzzemen/app-utility';
import {LogicalConditionStringifier} from '@franzzemen/re-logical-condition';
import {RuleReference} from '../rule-reference';
import {RuleScope} from '../scope/rule-scope';
import {RuleHintKey} from '../util/rule-hint-key';
import {StringifyRuleOptions} from './stringify-rule-options';


export class RuleStringifier {
  constructor() {
  }

  stringify(ruleRef: RuleReference, scope: RuleScope, options?: StringifyRuleOptions, ec?: ExecutionContextI): string {
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
