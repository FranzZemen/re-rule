import {Hints} from '@franzzemen/hints';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {EndConditionType, LogicalOperator, ParserMessages, Scope} from '@franzzemen/re-common';
import {LogicalConditionGroupParser} from '@franzzemen/re-logical-condition';
import moment from 'moment';
import {v4 as uuidV4} from 'uuid';
import {RuleReference} from '../rule-reference.js';
import {ReRule} from '../scope/rule-execution-context.js';
import {RuleScope} from '../scope/rule-scope.js';
import {RuleHintKey} from '../util/rule-hint-key.js';
import {RuleContainerParser} from './rule-container-parser.js';

export class RuleParser extends RuleContainerParser<RuleReference> {
  constructor() {
    super(RuleHintKey.Rule, [RuleHintKey.RulesEngine, RuleHintKey.Application, RuleHintKey.RuleSet]);
  }

  protected createScope(options?: ReRule, parentScope?: Scope, ec?: LogExecutionContext): RuleScope {
    return new RuleScope(options, parentScope, ec);
  }

  protected createReference(refName: string, options: ReRule): RuleReference {
    return {refName, version: {major: 0, minor: 0, patch: 0}, options: {}, logicalConditionRef: undefined}
  }

  protected get defaultContainerName(): string {
    return `Rule ${moment().format('YYYY-MM-DDTHH:mm:ss')}:${uuidV4()}`
  }


  protected delegateParsing(ruleReference: RuleReference, near: string, scope: Scope, ec?: LogExecutionContext): [string, ParserMessages] {
    const log = new LoggerAdapter(ec, 're-rule', 'rule-parser', 'delegateParsing');
    let remaining = near;
    let messages: ParserMessages = [];

    // A logical rule (only rule type right now) has a well defined structure (Logical conditions, conditions, lhs, comparator, rhs etc.)


    // Continue to end of input or until a new Rule is encountered
    while(remaining.length > 0) {
      const logicalConditionGroupParser: LogicalConditionGroupParser = new LogicalConditionGroupParser();

      let endConditionType: EndConditionType;
      let localParserMessages: ParserMessages;

      [remaining, ruleReference.logicalConditionRef , endConditionType, localParserMessages] = logicalConditionGroupParser.parse(
        remaining,
        scope,
        [LogicalOperator.andNot, LogicalOperator.and, LogicalOperator.orNot, LogicalOperator.or], LogicalOperator.and,
        [/^<<(?:ap|rs|ru)[^]*$/],
        undefined,
        ec);
      if(localParserMessages && localParserMessages.length > 0) {
        messages = messages.concat(localParserMessages);
      }
      switch (endConditionType) {
        case EndConditionType.Noop:
          const err = `End condition type ${EndConditionType.Noop} is unexpected`;
          log.error(err);
          throw err;
        default:
          break;
      }
      const hints = Hints.peekHints(remaining, '', ec);
      // TODO: Make creative use of property parentHintBlocks to avoid referring up in the hierarchy
      if(hints?.has(RuleHintKey.RulesEngine)) {
        const err = new Error(`Unexpected rules engine block near "${near}" and before "${remaining}"`);
        log.error(err);
        throw err;
      } else if (hints?.has(RuleHintKey.Application) || hints?.has(RuleHintKey.RuleSet) || hints?.has(RuleHintKey.Rule)) {
        break;
      }
    }
    return [remaining, messages];
  }
}



