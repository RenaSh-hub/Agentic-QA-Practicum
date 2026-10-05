import dotenv from 'dotenv';
import { initTracker } from './record-tracker';
import { resetParentAuthStore } from './parent-auth-store';

dotenv.config();

async function globalSetup(): Promise<void> {
  initTracker();
  resetParentAuthStore();
}

export default globalSetup;
