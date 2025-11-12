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
// Log RPC endpoints for debugging
const rpcEndpoint = process.env.RPC_ENDPOINT || '';
const rpcWebsocketEndpoint = process.env.RPC_WEBSOCKET_ENDPOINT || '';
console.log('RPC_ENDPOINT:', rpcEndpoint);
console.log('RPC_WEBSOCKET_ENDPOINT:', rpcWebsocketEndpoint);

// quick RPC health check to surface bad endpoints early
if (rpcEndpoint) {
  try {
    const testConnection = new Connection(rpcEndpoint);
    testConnection.getVersion().then((v) => {
      console.log('RPC version:', v);
    }).catch((err) => {
      console.error('Failed to call RPC endpoint. Please verify RPC_ENDPOINT is correct. Error:', err.message || err);
    });
  } catch (e: any) {
    console.error('Invalid RPC_ENDPOINT format:', e?.message || e);
  }
} else {
  console.warn('RPC_ENDPOINT is not set. Set RPC_ENDPOINT in your environment or .env file.');
}
const decodedKey = new Uint8Array(
  JSON.parse(Fs.readFileSync(authKeypairPath).toString()) as number[]
);
const keypair = Keypair.fromSecretKey(decodedKey);

const client = new Client(" http://rpc.corvus-labs.io:10101/", undefined, undefined); //grpc endpoint from Solana Vibe Station obviously


async function start() {

  await init();

  streamNewTokens(client);
  streamOpenbook(client);

}

start();
