import type { AWS } from '@serverless/typescript';

import hello from '@functions/hello';
import tokenization from '@functions/tokenization';
import dynamodbTables from './src/dynamo/resources';

const serverlessConfiguration: AWS = {
  service: 'culqi-tech-backend-test',
  frameworkVersion: '3',
  plugins: ['serverless-esbuild','serverless-dynamodb','serverless-offline'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    stage: "${opt:stage, 'dev'}",
    region: 'us-east-1',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
    },
    iam: {
      role: {
        statements: [
          {
            Effect: 'Allow',
            Action: [
              "dynamodb:DescribeTable",
              "dynamodb:Query",
              "dynamodb:Scan",
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem",
              "dynamodb:DeleteItem",
            ],
            Resource: "arn:aws:dynamodb:${self:provider.region}:${aws:accountId}:table/${self:custom.tableName}",
          }
        ]
      }
    }
  },
  functions: { hello, tokenization },
  resources: {
    Resources: {
      ...dynamodbTables,
    }
  },
  package: { individually: true },
  custom: {
    tableName: 'culqi-tech-backend-test-table',
    "serverless-dynamodb": {
      stage: "dev",
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
        seed: true,
      },
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;