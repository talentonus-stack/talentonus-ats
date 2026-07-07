const fs = require('fs');
const file = 'src/app/password-resets/page.tsx';
let data = fs.readFileSync(file, 'utf8');
data = data.replace(
  'status: req.status',
  'status: req.status as "PENDING" | "COMPLETED"'
);
fs.writeFileSync(file, data);
