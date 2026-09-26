






import { sha256Hex } from '../src/lib/crypto';

const password = process.argv[2];
if (!password) {
  console.error('Usage: npx tsx scripts/hash-password.ts <password>');
  process.exit(1);
}

sha256Hex(password).then((hash) => {
  console.log(hash);
});
