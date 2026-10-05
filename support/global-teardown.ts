import dotenv from 'dotenv';
import { cleanupCreatedRecords } from './cleanup-records';

dotenv.config();

async function globalTeardown(): Promise<void> {
  await cleanupCreatedRecords();
}

export default globalTeardown;
