

export class LogicalRule /* extends Rule*/ {

  constructor() {
  }




}

/*
// TODO:  fully support attributes, arrays etc.
// TODO: function expressions
// TODO: Load stuff (functions, data types, operators)
// TODO:  What if the domain object does not contain the reference item
// TODO:  Rules using rules
// TODO:  Is it just Rule or LogicalRule????

import {ExecutionContextI} from '@franzzemen/app-utility';
import {LoggerAdapter} from '@franzzemen/app-utility/log/logger-adapter';
import {Condition} from '../condition/condition';
import {ConditionReference} from '../condition/condition-reference';
import {DataTypeFactory} from '../data-type';
import {AttributeExpression, AttributeExpressionReference} from '../expression/attribute-expression';
import {Expression, ExpressionReference, ExpressionType} from '../expression/expression';
import {ValueExpression, ValueExpressionReference} from '../expression/value-expression';
import {isRecursiveGrouping} from '../recursive-grouping/recursive-grouping';
import {ValidationResult} from '../validation-result';
import {islogicalConditionArray, LogicalCondition, LogicalConditionResult} from '../logical-condition/logical-condition';
import {LogicalConditionGroupReference, LogicalOperator} from '../logical-condition/logical-condition-group-reference';
import {Rule} from './rule';
import {RuleReference} from './rule-reference';


export interface LogicalRuleReference extends RuleReference {
  logicalConditionsRef:  LogicalConditionReference;
}
*/

/*
export interface  LogicalRuleI {
  validate(item:any, execContext?: ExecutionContextI): ValidationResultI;
  conditions: LogicalCondition;
}

 */
/*
export function isLogicalRuleReference(ref: LogicalRuleReference | any): ref is LogicalRuleReference {
  return ref?.refName?.trim().length > 0 && ref?.version && ref?.logicalConditionsRef;
}*/

/*
export function isLogicalRule(ref: LogicalRule | any): ref is LogicalRule {
  return ref?.refName?.trim().length > 0 && ref?.version && ref?.conditions && 'validate' in ref;
}

 */

// TODO: Enforce rule is frozen so as to not have changes while execution is ongoing
// TODO: Evaluate rule using promises (for custom async stuff)...
/*
export class LogicalRule extends Rule {
  conditions: LogicalCondition;
  static className = LogicalRule.name;

  constructor(ref: RuleReference, dataTypeFactory: DataTypeFactory, execContext?: ExecutionContextI) {
    super(ref, execContext);
    const log = new LoggerAdapter(execContext, 'rules-engine', 'rule', LogicalRule.className + '.constructor');
    // -----
    log.debug(ref, 'Creating LogicalRule');
    // -----
    if(isLogicalRule(ref)) {
      this.createFromCopy(ref, dataTypeFactory, execContext);
    } else if(isLogicalRuleReference(ref)) {
      this.createFromReference(ref, dataTypeFactory, execContext);
    } else {
      throw new Error('Implement This');
      //this.createFromText(ref);
    }
  }


  createFromReference(ref: LogicalRuleReference, dataTypeFactory, execContext?: ExecutionContextI) {
    this.refName = ref.refName;
    if(ref.version) {
      this.version = {major: ref.version.major, minor: ref.version.minor, patch: ref.version.patch};
    } else {
      this.version = {major: 0, minor: 0, patch: 0};

    }
    if (isRecursiveGrouping(ref.logicalConditionsRef)) {
      this.conditions = {
        logicalOperator: ref.logicalConditionsRef.operator,
        condition: LogicalRule.recurseConditionRef(ref.logicalConditionsRef.conditionRef, dataTypeFactory, execContext)
      }
    } else {
      this.conditions = {
        logicalOperator: ref.logicalConditionsRef.logicalOperator,
        condition: new Condition(ref.logicalConditionsRef.conditionRef, dataTypeFactory, execContext)
      };
    }
  }

  createFromCopy(copy: LogicalRule, dataTypeFactory: DataTypeFactory, execContext?: ExecutionContextI) {
    this.refName = copy.refName;
    if(copy.version) {
      this.version = {major: copy.version.major, minor: copy.version.minor, patch: copy.version.patch};
    } else {
      this.version = {major: 0, minor: 0, patch: 0};

    }
    if(Array.isArray(copy.conditions.condition)) {
      this.conditions = {
        logicalOperator: copy.conditions.logicalOperator,
        condition: LogicalRule.recurseCondition(copy.conditions.condition, dataTypeFactory, execContext)
      }
    } else {
      this.conditions = {
        logicalOperator: copy.conditions.logicalOperator,
        condition: new Condition(copy.conditions.condition, dataTypeFactory, execContext)
      }
    }
  }


  asReferences(): LogicalRuleReference {
    const ruleRef: Partial<LogicalRuleReference> = {refName: this.refName, version: this.version};
    ruleRef.logicalConditionsRef = this.recurseLogicalConditionsAsReferences(this.conditions);
    return ruleRef as LogicalRuleReference;
  }

  recurseLogicalConditionsAsReferences(logicalCondition: LogicalCondition): LogicalConditionReference {
    const logicalConditionRef: Partial<LogicalConditionReference> = {logicalOperator: logicalCondition.logicalOperator};
    if(islogicalConditionArray(logicalCondition.condition)) {
      const conditionRef: LogicalConditionReference[] = [];
      logicalConditionRef.conditionRef = conditionRef;
      logicalCondition.condition.forEach(eachLogicalCondition => {
        conditionRef.push(this.recurseLogicalConditionsAsReferences(eachLogicalCondition));
      });
    } else {
      const conditionReference: Partial<ConditionReference> = {comparatorRef: logicalCondition.condition.comparator.refName};
      conditionReference.lhsRef = this.expressionAsReference(logicalCondition.condition.lhs);
      conditionReference.rhsRef = this.expressionAsReference(logicalCondition.condition.rhs);
      logicalConditionRef.conditionRef = conditionReference as ConditionReference;
    }
    return logicalConditionRef as LogicalConditionReference;
  }

  expressionAsReference(expression: Expression) : ExpressionReference {
    const expressionRef: Partial<ExpressionReference> = {type: expression.type, dataTypeRef: expression.dataType.refName};
    switch (expression.type) {
      case ExpressionType.Value:
        const valueExpressionRef: Partial<ValueExpressionReference> = expressionRef as ValueExpressionReference;
        valueExpressionRef.value = (expression as ValueExpression).value;
        break;
      case ExpressionType.Attribute:
        const attributeExpressionRef: Partial<AttributeExpressionReference> = expressionRef as AttributeExpressionReference;
        attributeExpressionRef.path = (expression as AttributeExpression).path;
        break;
    }
    return expressionRef as ExpressionReference;
  }


  private static recurseConditionRef(ref: LogicalConditionReference [], dataTypeFactory: DataTypeFactory, execContext?: ExecutionContextI): LogicalCondition[] {
    const logicalConditions: LogicalCondition[] = [];
    ref.forEach(logicalConditionRef => {
      if(Array.isArray(logicalConditionRef.conditionRef)) {
        logicalConditions.push({logicalOperator: logicalConditionRef.logicalOperator, condition: LogicalRule.recurseConditionRef(logicalConditionRef.conditionRef, dataTypeFactory, execContext)});
      } else {
        logicalConditions.push({logicalOperator: logicalConditionRef.logicalOperator, condition: new Condition(logicalConditionRef.conditionRef, dataTypeFactory, execContext)});
      }
    });
    return logicalConditions;
  }

  private static recurseCondition(conditions: LogicalCondition [], dataTypeFactory: DataTypeFactory, execContext?: ExecutionContextI): LogicalCondition[] {
    const logicalConditions: LogicalCondition[] = [];
    conditions.forEach(logicalCondition => {
      if(Array.isArray(logicalCondition.condition)) {
        logicalConditions.push({logicalOperator: logicalCondition.logicalOperator, condition: LogicalRule.recurseCondition(logicalCondition.condition, dataTypeFactory, execContext)});
      } else {
        logicalConditions.push({logicalOperator: logicalCondition.logicalOperator, condition: new Condition(logicalCondition.condition, dataTypeFactory, execContext)});
      }
    });
    return logicalConditions;
  }

  validate (item:any, execContext?: ExecutionContextI): Promise<ValidationResult> {
    if(true) {
      throw new Error('Cleanup promise')
    }
    return new Promise<ValidationResult>((resolve, reject)=> {
      const log = new LoggerAdapter(execContext, 'rules-engine', 'rule', LogicalRule.className + '.validate');
      const localContext = `${this.refName}" version:${this.version.major}.${this.version.minor}.${this.version.patch}`
      // -----
      log.debug(item, 'Validating item for rule ' + localContext);
      // -----
      const oldContext = execContext?.localContext;
      if(execContext === undefined) {
        execContext = {localContext}
      } else {
        execContext.localContext = execContext.localContext ? execContext.localContext + ' - ' + localContext : localContext;
      }

      let logicalConditionResult: LogicalConditionResult;
      try {
        logicalConditionResult = LogicalRule.evaluateConditions(this.conditions, item, execContext);
        const result: Partial<ValidationResult> = {valid: logicalConditionResult.result, ruleRef: this.refName};
        // -----
        log.debug(result, 'Result');
        // -----
        resolve(result as ValidationResult);
      } finally {
        execContext.localContext = oldContext;
      }
    });
  }

  private static evaluateConditions(logicalCondition: LogicalCondition, item: any, execContext?:ExecutionContextI): LogicalConditionResult {
    const log = new LoggerAdapter(execContext, 'rules-engine', 'rule', LogicalRule.className + ':evaluateConditions');
    if(logicalCondition !== undefined) {
      if(islogicalConditionArray(logicalCondition.condition)) {
        // -----
        log.trace(logicalCondition,'Found LogicalCondition[]');
        // -----
        const logicalResults: LogicalConditionResult[] = [];
        logicalCondition.condition.forEach(opCondition => {
          // Call recursively
          logicalResults.push(LogicalRule.evaluateConditions(opCondition, item));
        });
        return LogicalRule.reduce(logicalCondition.logicalOperator, logicalResults);
      } else {
        // -----
        log.trace(logicalCondition,'Found LogicalCondition');
        // -----
        const result: LogicalConditionResult = {logicalOperator: logicalCondition.logicalOperator, result: logicalCondition.condition.isValid(item)};
        // -----
        log.trace(result, 'Result of evaluating conditions');
        return result;
      }
    } else {
      const err = new Error ('Undefined logicalCondition');
      // -----
      log.error(err);
      // -----
      throw err;
    }
  }
}

 */
