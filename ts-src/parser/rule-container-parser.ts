import {ExecutionContextI, Hints, LoggerAdapter} from '@franzzemen/app-utility';
import {HintKey, NamedReference, Options, ParserMessages, Scope} from '@franzzemen/re-common';
import {RuleScope} from '../scope/rule-scope.js';

export abstract class RuleContainerParser<Ref extends NamedReference> {

  constructor(protected hintBlock: string, protected parentHintBlocks: string[]) {
  }

  protected get defaultContainerName(): string {
    return 'Default';
  };

  parse(near: string, parentScope?: Scope, ec?: ExecutionContextI): [string, Ref, ParserMessages] {
    const log = new LoggerAdapter(ec, 're-rule', 'rule-container-parser', 'parse');
    let remaining = near;
    let ref: Ref;
    let messages: ParserMessages = [];

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
      let options: Options;
      if (hints?.has(this.hintBlock)) {
        refName = hints.get(HintKey.Name) as string;
        options = hints.get(HintKey.Options) as Options;
        // If the hints are for this level, consume them (we already have them, so we don't need to reparse entirely)
        remaining = Hints.consumeHints(near, '', ec);
        // At this moment there is no reason to keep the hints around (we may encounter cases where we might want to
        // pass them to delegateParsing...so remember...
        hints = undefined;
      }
      if (!refName) {
        refName = this.defaultContainerName;
      }
      options = options ? options : {};
      ref = this.createReference(refName, options);
      const scope = this.createScope(options, parentScope, ec);
      let localMessages: ParserMessages;
      [remaining, localMessages] = this.delegateParsing(ref, remaining, scope, ec);
      if(localMessages && localMessages.length > 0) {
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

  protected abstract createReference(refName: string, options: Options): Ref;

  protected abstract delegateParsing(ref: Ref, near: string, scope: RuleScope, ec?: ExecutionContextI): [string, ParserMessages];

  protected abstract createScope(options?: Options, parentScope?: Scope, ec?: ExecutionContextI): RuleScope;
}
