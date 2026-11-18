const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  await prisma.match.deleteMany();
  await prisma.verificationProof.deleteMany();
  await prisma.user.deleteMany();
  const password = await bcrypt.hash('ffscout-admin-demo', 10);
  const admin = await prisma.user.create({ data: { email: 'admin@ffscout.dev', passwordHash: password, displayName: 'Admin', userType: 'admin', city: 'Hyderabad' } });
  const players = [
    ['RushKing_21', 'VJIT', 'Heroic', 'fragger', true],
    ['iG_Lx0', 'Ganjikhana', 'Master', 'sniper', true],
    ['Honor_Chur', 'VJIT', 'Diamond', 'support', true],
    ['DeadlyViper', 'VJIT', 'Gold', 'igled', false],
    ['ghost_shivam', 'Ganjikhana', 'Silver', 'lurker', false],
  ];
  for (const [name, college, rank, role, verified] of players) {
    await prisma.user.create({ data: { email: name.toLowerCase() + '@ffscout.dev', passwordHash: password, displayName: name, userType: 'player', college, city: 'Hyderabad', rank, role, verified, status: 'looking' } });
  }
  // organizer
  await prisma.user.create({ data: { email: 'org@ganjikhanafest.dev', passwordHash: password, displayName: 'Ganjikhana Fest', userType: 'organizer', orgName: 'Ganjikhana Cyber Smash', orgType: 'LAN Event', city: 'Hyderabad' } });
  console.log('seeded');
  await prisma.$disconnect();
}
main();
