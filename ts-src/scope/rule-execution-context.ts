/*
Created by Franz Zemen 11/06/2022
License Type: 
*/

import {AppExecutionContextDefaults, appSchemaWrapper} from '@franzzemen/app-execution-context';
import {ExecutionContextDefaults, executionSchemaWrapper} from '@franzzemen/execution-context';
import {LogExecutionContextDefaults, logSchemaWrapper} from '@franzzemen/logger-adapter';
import {commonOptionsSchemaWrapper} from '@franzzemen/re-common';
import {dataTypeOptionsSchemaWrapper} from '@franzzemen/re-data-type';
import {expressionOptionsSchemaWrapper} from '@franzzemen/re-expression';
import {LogicalConditionExecutionContext, ReLogicalCondition} from '@franzzemen/re-logical-condition';
import Validator, {ValidationError} from 'fastest-validator';
import {isPromise} from 'util/types';

export interface RuleOptions {
}

export interface ReRule extends ReLogicalCondition {
  rule?: RuleOptions;
}

export interface RulelExecutionContext extends LogicalConditionExecutionContext {
  re?: ReRule;
}

export class RuleExecutionContextDefaults {
  static RuleOptions: RuleOptions = {
  }
  static ReRule: ReRule = {
    rule: RuleExecutionContextDefaults.RuleOptions
  }
  static RuleExecutionContext: RulelExecutionContext = {
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
  common: commonOptionsSchemaWrapper,
  data: dataTypeOptionsSchemaWrapper,
  expression: expressionOptionsSchemaWrapper,
  condition: ruleOptionsSchemaWrapper,
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


export function isRuleExecutionContext(options: any | RulelExecutionContext): options is RulelExecutionContext {
  return options && 're' in options; // Faster than validate
}

const check = (new Validator({useNewCustomCheckerFunction: true})).compile(ruleExecutionContextSchema);

export function validate(context: RulelExecutionContext): true | ValidationError[] {
  const result = check(context);
  if (isPromise(result)) {
    throw new Error('Unexpected asynchronous on RulelExecutionContext validation');
  } else {
    if (result === true) {
      context.validated = true;
    }
    return result;
  }
}


