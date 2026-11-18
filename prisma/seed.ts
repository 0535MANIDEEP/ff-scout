import { config } from 'dotenv';
config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const p1 = await prisma.player.create({
    data: {
      displayName: 'RushKing',
      role: 'fragger',
      college: 'VJIT',
      city: 'Hyderabad',
      rank: 'Heroic',
      verified: true,
      status: 'looking',
    },
  });
  console.log('Seeded:', p1.id);
}
main().finally(() => prisma.$disconnect());
