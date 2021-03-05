/* eslint-disable  @typescript-eslint/no-unused-vars */
import * as Sentry from '@sentry/serverless';

import { APIGatewayEvent, Context } from 'aws-lambda';

import createLogger, { Logger } from './logger';

require('@sentry/tracing');

Sentry.AWSLambda.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.STAGE,
  tracesSampleRate: 1.0,
});

type LambdaOptions = {
  name: string;
};

export type EnhancedContext = Context & {
  logger: Logger;
  sentry: unknown;
};

export const lambdaWrapper = (lambda: Function, options: LambdaOptions) => {
  const { name } = options;

  const logger = createLogger(name);

  return Sentry.AWSLambda.wrapHandler(
    async (event: APIGatewayEvent, context: Context) => {
      logger.info(`Event received - ${JSON.stringify(event)}}`);

      return lambda(event, {
        logger,
        sentry: Sentry,
        ...context,
      });
    }
  );
};
