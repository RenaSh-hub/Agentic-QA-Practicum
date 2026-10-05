import type { FullConfig, Reporter } from '@playwright/test/reporter';
import { cleanupCreatedRecords } from './cleanup-records';

class CleanupReporter implements Reporter {
  async onEnd(): Promise<void> {
    await cleanupCreatedRecords();
  }

  printsToStdio(): boolean {
    return true;
  }

  onBegin(_config: FullConfig): void {
    // Tracker is initialized in globalSetup.
  }
}

export default CleanupReporter;
