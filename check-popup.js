const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const now = new Date();
const todayStart = new Date(now);
todayStart.setHours(0, 0, 0, 0);

console.log('now:', now.toISOString());
console.log('todayStart:', todayStart.toISOString());

// Simulate the exact query from content.service.ts
p.popup.findMany({
  where: {
    published: true,
    OR: [
      { startDate: null },
      { startDate: { lte: now } },
    ],
    AND: [
      {
        OR: [
          { endDate: null },
          { endDate: { gte: todayStart } },
        ],
      },
    ],
  },
  orderBy: { createdAt: 'desc' },
}).then(d => {
  console.log('result count:', d.length);
  d.forEach(r => console.log(`id=${r.id} title=${r.title} start=${r.startDate?.toISOString()} end=${r.endDate?.toISOString()}`));
  
  // Also try without the OR/AND
  return p.popup.findMany({ where: { published: true } });
}).then(d => {
  console.log('\nAll published:', d.length);
  d.forEach(r => console.log(`id=${r.id} title=${r.title} start=${r.startDate?.toISOString()} end=${r.endDate?.toISOString()}`));
  p.$disconnect();
});
