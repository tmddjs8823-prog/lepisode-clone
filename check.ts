import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.translation.findUnique({ where: { key: 'terms.title' }});
  console.log('terms.title:', t);
  const f = await prisma.translation.findUnique({ where: { key: 'footer.privacy' }});
  console.log('footer.privacy:', f);
}
main().finally(() => prisma.$disconnect());
