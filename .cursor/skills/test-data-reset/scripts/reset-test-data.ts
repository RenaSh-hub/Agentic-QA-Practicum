import dotenv from 'dotenv';
import { existsSync } from 'fs';
import { AUTH_FILE, ALT_AUTH_FILE } from '../../../../support/auth.constants';
import { cleanupTrackedRecords } from '../../../../support/cleanup-records';
import {
  getTrackedRecords,
  TrackedRecordType,
  type TrackedRecordType as TrackedRecordTypeName,
} from '../../../../support/record-tracker';

dotenv.config();

type CliOptions = {
  dryRun: boolean;
  type?: TrackedRecordTypeName;
};

const KNOWN_TYPES = new Set<string>(Object.values(TrackedRecordType));

function parseArgs(argv: string[]): CliOptions {
  let dryRun = false;
  let type: TrackedRecordTypeName | undefined;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--type') {
      const value = argv[i + 1];
      if (!value) {
        throw new Error('--type requires a value (e.g. parent)');
      }
      if (!KNOWN_TYPES.has(value)) {
        throw new Error(`Unknown type "${value}". Known: ${[...KNOWN_TYPES].join(', ')}`);
      }
      type = value as TrackedRecordTypeName;
      i += 1;
    }
  }
  return { dryRun, type };
}

function authFileForOwner(owner: 'main' | 'alt'): string {
  return owner === 'main' ? AUTH_FILE : ALT_AUTH_FILE;
}

function missingAuthFiles(records: ReturnType<typeof getTrackedRecords>): string[] {
  const owners = new Set(records.map((r) => r.owner));
  const missing: string[] = [];
  for (const owner of owners) {
    const file = authFileForOwner(owner);
    if (!existsSync(file)) {
      missing.push(file);
    }
  }
  return missing;
}

function printSummary(
  summary: Awaited<ReturnType<typeof cleanupTrackedRecords>>,
  dryRun: boolean,
): void {
  console.log('');
  console.log('## Result');
  console.log(`- **Scope:** ${summary.scope}${dryRun ? ' (dry-run)' : ''}`);
  console.log(`- **Found:** ${summary.found}`);
  console.log(`- **Deleted:** ${summary.deleted}`);
  console.log(`- **Failed:** ${summary.failed}`);
  if (summary.alreadyRemoved > 0) {
    console.log(`- **Already removed:** ${summary.alreadyRemoved}`);
  }
  if (summary.authExpired) {
    console.log('- **Auth:** storage state expired — re-run `npx playwright test --project=setup`');
  }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const tracked = getTrackedRecords();
  const targets = options.type ? tracked.filter((r) => r.type === options.type) : tracked;

  if (targets.length === 0) {
    const summary = await cleanupTrackedRecords({ dryRun: options.dryRun, type: options.type });
    printSummary(summary, options.dryRun);
    return;
  }

  const missing = missingAuthFiles(targets);
  if (missing.length > 0) {
    console.error(`Missing auth file(s): ${missing.join(', ')}`);
    console.error('Run: npx playwright test --project=setup');
    process.exit(1);
  }

  const summary = await cleanupTrackedRecords({
    dryRun: options.dryRun,
    type: options.type,
  });
  printSummary(summary, options.dryRun);

  if (summary.authExpired) {
    process.exit(1);
  }
  if (summary.failed > 0 && !options.dryRun) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
