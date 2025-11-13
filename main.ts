import { streamNewTokens } from './streaming/raydium';
import { streamOpenbook } from './streaming/openbook';

require('dotenv').config();


import * as Fs from 'fs';

import { Connection, Keypair, PublicKey, TransactionMessage, VersionedMessage, VersionedTransaction } from '@solana/web3.js';
import { logger } from './utils/logger';
import { init } from './transaction/transaction';
import Client from '@triton-one/yellowstone-grpc';

const blockEngineUrl = process.env.BLOCK_ENGINE_URL || '';
console.log('BLOCK_ENGINE_URL:', blockEngineUrl);

const authKeypairPath = process.env.AUTH_KEYPAIR_PATH || '';
console.log('AUTH_KEYPAIR_PATH:', authKeypairPath);
const decodedKey = new Uint8Array(
  JSON.parse(Fs.readFileSync(authKeypairPath).toString()) as number[]
);
const keypair = Keypair.fromSecretKey(decodedKey);

// Fix GRPC URL - remove leading space
const grpcEndpoint = process.env.GRPC_ENDPOINT || "http://rpc.corvus-labs.io:10101/";
const client = new Client(grpcEndpoint.trim(), undefined, undefined);

async function start() {
  try {
    await init();

    // Start streaming with error handling and retry logic
    streamNewTokens(client).catch((error) => {
      logger.error(`Failed to stream new tokens: ${error}`);
      logger.info('Attempting to reconnect in 5 seconds...');
      setTimeout(() => {
        streamNewTokens(client).catch((err) => logger.error(`Retry failed: ${err}`));
      }, 5000);
    });

    streamOpenbook(client).catch((error) => {
      logger.error(`Failed to stream openbook: ${error}`);
      logger.info('Attempting to reconnect in 5 seconds...');
      setTimeout(() => {
        streamOpenbook(client).catch((err) => logger.error(`Retry failed: ${err}`));
      }, 5000);
    });
  } catch (error) {
    logger.error(`Failed to start bot: ${error}`);
    process.exit(1);
  }
}

start();
