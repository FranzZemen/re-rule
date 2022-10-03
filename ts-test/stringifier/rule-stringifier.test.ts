import 'mocha';
import chai from 'chai';
import {RuleParser, RuleScope, RuleStringifier} from '../../publish/index.js';


const expect = chai.expect;
const should = chai.should();

const unreachableCode = false;
const scope = new RuleScope();
const parser = new RuleParser();
const stringifier = new RuleStringifier();

describe('Rules Engine Tests', () => {
  describe('Rule Stringifier Tests', () => {
    describe('core/rule/stringifier/rule-stringifier.test', () => {
      it('should stringify simple rule "Hello" = world', done => {
        const [remaining, ruleRef] = parser.parse('"Hello" = world');
        const stringified = stringifier.stringify(ruleRef, scope);
        stringified.should.equal(`<<ru name="${ruleRef.refName}">> "Hello" = world`);
        done();
      })
    })
  })
})


