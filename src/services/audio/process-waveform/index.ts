import childProcess from 'child_process';
import uuidv4 from 'uuid/v4';
import fs from 'fs';
import path from 'path';
import os from 'os';

import { createS3Client } from '../../../utils/aws/s3';

import { lambdaWrapper } from '../../../utils/handler-wrapper';
import getConfig from '../../../utils/config';

import { parseMessageBody } from '../../../utils/helpers';

import customConfig from './config';

const createClients = (config: any) => ({
  s3: createS3Client(),
});

async function processTrackWaveform(event: any, { logger }: any) {
  const config = getConfig(customConfig);

  const clients = createClients(config);

  try {
    const { Records } = event;

    const sqsRecords = parseMessageBody(Records);

    if (!sqsRecords.length) {
      throw new Error(`No SQS records to process: ${sqsRecords}`);
    }

    const {
      trackId
    } = sqsRecords[0];

    if (!trackId) {
      throw new Error('Invalid SQS body :: trackId is required');
    }

    logger.info(`Processing track waveform :: Track Id ${trackId}`);

    // ... process waveform

    logger.info(`Waveform processing complete :: Track Id - ${trackId} Waveform Id`);
  } catch (error) {
    logger.error(error.message);

    throw error;
  }
}

const options = {
  name: 'process-track-waveform',
};

export const handler = lambdaWrapper(
  async (event, context) => processTrackWaveform(event, context),
  options
);