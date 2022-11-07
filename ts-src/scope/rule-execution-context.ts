/*
Created by Franz Zemen 11/06/2022
License Type: 
*/

import {AppExecutionContextDefaults, appSchemaWrapper} from '@franzzemen/app-execution-context';
import {ExecutionContextDefaults, executionSchemaWrapper} from '@franzzemen/execution-context';
import {LogExecutionContextDefaults, logSchemaWrapper} from '@franzzemen/logger-adapter';
import {CommonExecutionContextDefaults, commonOptionsSchemaWrapper} from '@franzzemen/re-common';
import {ConditionExecutionContextDefaults, conditionOptionsSchemaWrapper} from '@franzzemen/re-condition';
import {DataTypeExecutionContextDefaults, dataTypeOptionsSchemaWrapper} from '@franzzemen/re-data-type';
import {ExpressionExecutionContextDefaults, expressionOptionsSchemaWrapper} from '@franzzemen/re-expression';
import {
  LogicalConditionExecutionContext, LogicalConditionExecutionContextDefaults,
  logicalConditionOptionsSchemaWrapper,
  ReLogicalCondition
} from '@franzzemen/re-logical-condition';
import Validator, {ValidationError} from 'fastest-validator';
import {isPromise} from 'util/types';

export interface RuleOptions {
}

export interface ReRule extends ReLogicalCondition {
  're-rule'?: RuleOptions;
}

export interface RuleExecutionContext extends LogicalConditionExecutionContext {
  re?: ReRule;
}

export class RuleExecutionContextDefaults {
  static RuleOptions: RuleOptions = {
  }
  static ReRule: ReRule = {
    're-common': CommonExecutionContextDefaults.CommonOptions,
    're-data-type': DataTypeExecutionContextDefaults.DataTypeOptions,
    're-expression': ExpressionExecutionContextDefaults.ExpressionOptions,
    're-condition': ConditionExecutionContextDefaults.ConditionOptions,
    're-logical-condition': LogicalConditionExecutionContextDefaults.LogicalConditionOptions,
    're-rule': RuleExecutionContextDefaults.RuleOptions
  }
  static RuleExecutionContext: RuleExecutionContext = {
    execution: ExecutionContextDefaults.Execution(),
    app: AppExecutionContextDefaults.App,
    log: LogExecutionContextDefaults.Log,
    re: RuleExecutionContextDefaults.ReRule
  };
}

export const ruleOptionsSchema = {
};

export const ruleOptionsSchemaWrapper = {
  type: 'object',
  optional: true,
  default: RuleExecutionContextDefaults.RuleOptions,
  props: ruleOptionsSchema
};

const reRuleSchema = {
  're-common': commonOptionsSchemaWrapper,
  're-data-type': dataTypeOptionsSchemaWrapper,
  're-expression': expressionOptionsSchemaWrapper,
  're-condition': conditionOptionsSchemaWrapper,
  're-logical-condition': logicalConditionOptionsSchemaWrapper,
  're-rule': ruleOptionsSchemaWrapper
};

export const reRuleSchemaWrapper = {
  type: 'object',
  optional: true,
  default: RuleExecutionContextDefaults.ReRule,
  props: reRuleSchema
};


export const ruleExecutionContextSchema = {
  execution: executionSchemaWrapper,
  app: appSchemaWrapper,
  log: logSchemaWrapper,
  re: reRuleSchemaWrapper
};

export const ruleExecutionContextSchemaWrapper = {
  type: 'object',
  optional: true,
  default: RuleExecutionContextDefaults.RuleExecutionContext,
  props: ruleExecutionContextSchema
};


export function isRuleExecutionContext(options: any | RuleExecutionContext): options is RuleExecutionContext {
  return options && 're' in options; // Faster than validate
}

const check = (new Validator({useNewCustomCheckerFunction: true})).compile(ruleExecutionContextSchema);

export function validate(context: RuleExecutionContext): true | ValidationError[] {
  const result = check(context);
  if (isPromise(result)) {
    throw new Error('Unexpected asynchronous on RuleExecutionContext validation');
  } else {
    if (result === true) {
      context.validated = true;
    }
    return result;
  }
}


