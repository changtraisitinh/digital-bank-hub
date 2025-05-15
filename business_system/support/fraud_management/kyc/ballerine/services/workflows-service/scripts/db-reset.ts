import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import * as process from 'node:process';
import { execSync } from 'child_process';

if (require.main === module) {
  dotenv.config();
  dbReset().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

async function dbReset() {
  if (process.env.DB_URL?.includes('rds.amazonaws.com')) {
    console.error('This script is not intended to be used in cloud');
    process.exit(1);
  }

  console.info('Before Running Prisma migrate reset check db server...');
  //https://nodejs.org/api/child_process.html#child_processexecsynccommand-options
  execSync('bash /Users/mac/Engineering/GitHub/digital-bank-hub/business_system/support/fraud_management/kyc/ballerine/services/workflows-service/scripts/waitDb.sh', { stdio: 'inherit' });

  console.info('Running Prisma migrate reset...');
  execSync('prisma migrate reset --skip-seed -f', { stdio: 'inherit' });

  console.info('Reset completed successfully');
}
