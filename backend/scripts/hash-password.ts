// Generate a SHA-256 hash of the admin password.
//
// Usage:  npx tsx scripts/hash-password.ts "your-password-here"
//
// Copy the printed hash and set it as the ADMIN_PASSWORD_HASH secret:
//   wrangler secret put ADMIN_PASSWORD_HASH

import { sha256Hex } from '../src/lib/crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <password>');
  process.exit(1);
}

sha256Hex(password).then((hash) => {
  console.log(hash);
});
