import _ from 'lodash';
import {Hints} from '@franzzemen/hints';
import {LogExecutionContext, LoggerAdapter} from '@franzzemen/logger-adapter';
import {HintKey, ParserMessages, Scope} from '@franzzemen/re-common';
import {ScopedReference} from '../rule-reference.js';
import {ReRule} from '../scope/rule-execution-context.js';
import {RuleScope} from '../scope/rule-scope.js';

export interface RuleOptionOverrides {
  refName: string,
  options: ReRule; // Base for others
}

export type DelegateOptions = {
  options?: ReRule, // Base for others
  overrides?: RuleOptionOverrides[]
}

export abstract class RuleContainerParser<Ref extends ScopedReference> {

  constructor(protected hintBlock: string, protected parentHintBlocks: string[]) {
  }

  protected get defaultContainerName(): string {
    return 'Default';
  };

  parse(near: string, delegateOptions?: DelegateOptions, parentScope?: Scope, ec?: LogExecutionContext): [string, Ref, ParserMessages] {
    const log = new LoggerAdapter(ec, 're-rule', 'rule-container-parser', 'parse');
    let remaining = near;
    let ref: Ref;
    let messages: ParserMessages = [];
    let ruleScope: RuleScope; // Base for RuleSetScope etc.
    // Parse while we have input (or an end condition has been reached)
    while (remaining.length > 0) {
      let hints: Hints = Hints.peekHints(remaining, '', ec);

      // After we've peeked hints at this level, the hints may be for this level or a level down.  They may also start a new
      // parent level.  If they start a new parent level, we need to break here, because we don't want to start creating a
      // tree of default objects that have no meaning.
      // TODO:  They may also start an ancestor block (for example going from rule to application)
      if (hints && this.parentHintBlocks.some(parentHintBlock => hints.has(parentHintBlock))) {
        break;
      }
      // Build the  reference
      let refName: string;
      let options: ReRule;
      if (hints?.has(this.hintBlock)) {
        refName = hints.get(HintKey.Name) as string;
        options = hints.get(HintKey.Options) as ReRule;
        // If the hints are for this level, consume them (we already have them, so we don't need to reparse entirely)
        remaining = Hints.consumeHints(near, '', ec);
        // At this moment there is no reason to keep the hints around (we may encounter cases where we might want to
        // pass them to delegateParsing...so remember...
        hints = undefined;
      }
      if (!refName) {
        refName = this.defaultContainerName;
      }
      let inputOptions = delegateOptions?.options;
      let overrideOptions = (delegateOptions?.overrides?.find(delegate => delegate.refName === refName))?.options;
      if (options) {
        if (inputOptions) {
          if (overrideOptions) {
            options = _.merge(inputOptions, overrideOptions, options);
          } else {
            options = _.merge(inputOptions, options);
          }
        } else if (overrideOptions) {
          options = _.merge(overrideOptions, options);
        }
      } else {
        if (inputOptions) {
          if (overrideOptions) {
            options = _.merge(inputOptions, overrideOptions, false);
          } else {
            options = inputOptions;
          }
        } else if (overrideOptions) {
          options = overrideOptions;
        }
      }
      ref = this.createReference(refName, options);

      ref.loadedScope = this.createScope(options, parentScope, ec);

      let localMessages: ParserMessages;
      [remaining, localMessages] = this.delegateParsing(ref, remaining, ref.loadedScope, ec);
      if (localMessages && localMessages.length > 0) {
        messages = messages.concat(localMessages);
      }
      // Check if there is a next hint and it is the same as "this" level, break if is so that parent can handle
      hints = Hints.peekHints(remaining, '', ec);
      if (hints?.has(this.hintBlock)) {
        break;
      }
    }
    return [remaining, ref, messages];
  }

  protected abstract createReference(refName: string, options: ReRule): Ref;

  protected abstract delegateParsing(ref: Ref, near: string, scope: Scope, ec?: LogExecutionContext): [string, ParserMessages];

  protected abstract createScope(options?: ReRule, parentScope?: Scope, ec?: LogExecutionContext): RuleScope;
}
