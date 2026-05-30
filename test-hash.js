const bcrypt = require('bcryptjs');

const hash = '$2a$10$w0M8n.i.QfB58P7Z.89Qee1Lp30mO9x8P08p51Z5/P0/75.4z66p.';
const plain = 'admin123';

const match = bcrypt.compareSync(plain, hash);
console.log('Match result:', match);

if (!match) {
  const newHash = bcrypt.hashSync(plain, 10);
  console.log('New hash:', newHash);
  console.log(`UPDATE "User" SET "password" = '${newHash}' WHERE "email" = 'admin@ats.com';`);
}
