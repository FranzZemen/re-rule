import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {EndConditionType, HintKey, LogicalOperator, Options, Scope} from '@franzzemen/re-common';
import {LogicalConditionParser} from '@franzzemen/re-logical-condition';
import moment from 'moment';
import {v4 as uuidV4} from 'uuid';
import {RuleReference} from '../rule-reference';
import {RuleScope} from '../scope/rule-scope';
import {RuleHintKey} from '../util/rule-hint-key';
import {RuleContainerParser} from './rule-container-parser';

export class RuleParser extends RuleContainerParser<RuleReference> {
  constructor() {
    super(RuleHintKey.Rule, [RuleHintKey.RulesEngine, RuleHintKey.Application, RuleHintKey.RuleSet]);
  }

  protected createScope(options?: Options, parentScope?: Scope, ec?: ExecutionContextI): Scope {
    return new RuleScope(options, parentScope, ec);
  }

  protected createReference(refName: string, options: Options): RuleReference {
    return {refName, version: {major: 0, minor: 0, patch: 0}, options: {}, logicalConditionRef: undefined}
  }

  protected get defaultContainerName(): string {
    return `Rule ${moment().format('YYYY-MM-DDTHH:mm:ss')}:${uuidV4()}`
  }


  protected delegateParsing(ruleReference: RuleReference, near: string, scope: Map<string, any>, ec: ExecutionContextI | undefined): string {
    const log = new LoggerAdapter(ec, 'rules-engine', 'rule-parser', 'delegateParsing');
    let remaining = near;

    // A logical rule (only rule type right now) has a well defined structure (Logical conditions, conditions, lhs, comparator, rhs etc.)


    // Continue to end of input or until a new Rule is encountered
    while(remaining.length > 0) {
      const logicalConditionParser: LogicalConditionParser = new LogicalConditionParser();

      let endConditionType: EndConditionType;

      [remaining, ruleReference.logicalConditionRef , endConditionType] = logicalConditionParser.parse(
        remaining,
        scope,
        [LogicalOperator.andNot, LogicalOperator.and, LogicalOperator.orNot, LogicalOperator.or], LogicalOperator.and,
        [/^<<(?:ap|rs|ru)[^]*$/],
        ec);
      switch (endConditionType) {
        case EndConditionType.Noop:
          const err = `End condition type ${EndConditionType.Noop} is unexpected`;
          log.error(err);
          throw err;
        default:
          break;
      }
      const hints = Hints.peekHints(remaining, '', ec);
      // TODO: Make creative use of property parentHintBlocks to avoid referrring up in the hierarchy
      if(hints?.has(RuleHintKey.RulesEngine)) {
        const err = new Error(`Unexpected rules engine block near "${near}" and before "${remaining}"`);
        log.error(err);
        throw err;
      } else if (hints?.has(RuleHintKey.Application) || hints?.has(RuleHintKey.RuleSet) || hints?.has(RuleHintKey.Rule)) {
        break;
      }
    }
    return remaining;
  }
}



