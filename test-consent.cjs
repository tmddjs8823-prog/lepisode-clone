const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.marketingConsent.deleteMany({ where: { email: 'test2@test.com' } })
  .then(r => console.log('Cleaned:', r))
  .finally(() => p.$disconnect());
