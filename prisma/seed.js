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
    ['RushKing_21', 'Rajawadi LAN', 'Heroic', 'fragger', true],
    ['iG_Lx0', 'In association with Vertex gaming co.', 'Master', 'sniper', true],
    ['Koje_Falcon', 'Hyderabad Squad', 'Diamond', 'sniper', true],
    ['Honor_Chur', 'VJIT', 'Diamond', 'support', true],
    ['DeadlyViper', 'Pro Guild', 'Heroic', 'igled', false],
    ['ghost_shivam', 'Invictus Mumbai', 'Silver', 'lurker', false],
  ];
  for (const [name, college, rank, role, verified] of players) {
    await prisma.user.create({ data: { email: name.toLowerCase() + '@ffscout.dev', passwordHash: password, displayName: name, userType: 'player', college, city: 'Hyderabad', rank, role, verified, status: 'looking' } });
  }
  await prisma.user.create({ data: { email: 'org@rajawadilans.dev', passwordHash: password, displayName: 'Rajawadi LAN', userType: 'organizer', orgName: 'Rajawadi Cyber Game Nite', orgType: 'LAN / gaming café', city: 'Hyderabad' } });
  console.log('seeded');
  await prisma.$disconnect();
}
main();
