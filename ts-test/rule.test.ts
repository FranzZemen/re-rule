import 'mocha';
import {isPromise} from '@franzzemen/re-common';
import chai from 'chai';
import {Rule, RuleParser} from '../publish';


const expect = chai.expect;
const should = chai.should();
const parser = new RuleParser();

const unReachableCode = false;

/*
Rules or their components are tested throughout different test suites, so testing here may be sparse
 */

describe('Rules Engine Tests', () => {
  describe('Rule Validation Tests', () => {
    describe('/core/rule/rule.test', () => {
      describe('static API', () => {
        const domain = {price: 5.0};
        const ruleText = 'price = 5.0';
        const [remaining, ruleReference] = parser.parse(ruleText);
        const rule = new Rule(ruleReference);

        it('should execute awaitRuleExecution for text', done => {
          const result = Rule.awaitRuleExecution(domain, ruleText);
          if (isPromise(result)) {
            result.then(ruleResult => {
              unReachableCode.should.be.true;
              done();
            });
          } else {
            result.valid.should.be.true;
            done();
          }
        });
        it('should execute awaitRuleExecution for reference', done => {
          const result = Rule.awaitRuleExecution(domain, ruleReference);
          if (isPromise(result)) {
            result.then(ruleResult => {
              unReachableCode.should.be.true;
              done();
            });
          } else {
            result.valid.should.be.true;
            done();
          }
        });
        it('should execute awaitRuleExecution for rule', done => {
          const result = Rule.awaitRuleExecution(domain, rule);
          if (isPromise(result)) {
            result.then(ruleResult => {
              unReachableCode.should.be.true;
              done();
            });
          } else {
            result.valid.should.be.true;
            done();
          }
        });
        it('should execute executeRuleSync for text', done => {
          const result = Rule.executeRuleSync(domain, ruleText);
          result.valid.should.be.true;
          done();
        });
        it('should execute executeRuleSync for rule reference', done => {
          const result = Rule.executeRuleSync(domain, ruleReference);
          result.valid.should.be.true;
          done();
        });
        it('should execute executeRuleSync for rule', done => {
          const result = Rule.executeRuleSync(domain, rule);
          result.valid.should.be.true;
          done();
        });
      });
    });
  });
});
