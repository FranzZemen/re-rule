import 'mocha';
import chai from 'chai';
import {RuleParser} from '../../publish';

const expect = chai.expect;
const should = chai.should();

const ruleParser = new RuleParser();


describe('Rules Engine Tests', () => {
  describe('Rule Parser Tests', () => {
    // Note that a lot of the testing occurs comprehensively in the sub-components
    // These tests are to ensure that we can independently parse a rule
    it('should handle empty text', done => {
      let [remaining, ruleRef] = ruleParser.parse('');
      remaining.should.equal('');
      expect(ruleRef).to.be.undefined;
      done();
    })
    it ('should handle empty rule <<ru>>', done => {
      let [remaining, ruleRef] = ruleParser.parse('<<ru>> ');
      remaining.should.equal('');
      expect(ruleRef).to.be.exist;
      expect(ruleRef.logicalConditionRef).to.not.exist;
      done();
    })
    it ('should handle a simple rule', done => {
      done();
    })
    it ('should handle a compound logical condition rule', done => {
      done();
    })
  })
})


