import { Pact } from '@pact-foundation/pact';
import path from 'path';

export const provider = new Pact({
  consumer: 'ams-web',
  provider: 'ams-api',
  port: 1234,
  log: path.resolve(process.cwd(), 'logs', 'pact.log'),
  dir: path.resolve(process.cwd(), 'e2e', 'pacts'),
  logLevel: 'info',
  pactfileWriteMode: 'merge',
});

export const pactConfig = {
  consumer: 'ams-web',
  provider: 'ams-api',
  pactBroker: '', // 不使用 broker
  pactBrokerToken: '',
  publishVerificationResult: false,
  providerVersionBranch: process.env.GIT_BRANCH || 'main',
  providerBaseUrl: 'http://localhost:8080',
  pactUrls: [
    path.resolve(process.cwd(), 'e2e', 'pacts', 'auth-login.json'),
    // Add more pact files here as they are generated
  ],
};
