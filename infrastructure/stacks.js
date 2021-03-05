#!/usr/bin/env node

const dotenv = require('dotenv');

dotenv.config();

const cdk = require('@aws-cdk/core');

const { Database } = require('./core/storage');
const { Storage } = require('./core/storage');

const { ApiService } = require('./services/api');
const { AuthService } = require('./services/auth');
const { AudioService } = require('./services/audio');

const app = new cdk.App();

const stage = process.env.STAGE;

const isDevelopment = stage !== 'production';

const env = {
  account: process.env.AWS_ACCOUNT_ID,
  region: 'eu-west-1',
  isDevelopment,
};

// Core
new Database(app, `${stage}-Database`, {
  serviceName: 'db',
  env,
  stage,
});

new Storage(app, `${stage}-Storage`, {
  serviceName: 'storage',
  env,
  stage,
});

// Services
const apiStack = new ApiService(app, `${stage}-ApiService`, {
  serviceName: 'api',
  env,
  stage,
});

new AuthService(app, `${stage}-AuthService`, {
  serviceName: 'auth',
  env,
  stage,
});

new AudioService(app, `${stage}-AudioService`, {
  serviceName: 'audio',
  env,
  stage,
  dependencies: {
    apiLambda: apiStack.apiLambda,
  },
});

app.synth();
