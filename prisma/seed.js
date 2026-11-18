// Seed demo data. Passwords in this file are intentionally shared so the
// reviewer can walk the verification queue end-to-end without guessing —
// every account uses 'ffscout-admin-demo'. Never point this at a real DB
// in anything public-facing:

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();

  // Wipe and rebuild everything — idempotent, safe to run repeatedly.
  await prisma.match.deleteMany();
  await prisma.verificationProof.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash('ffscout-admin-demo', 10);

  // The admin who is allowed to verify rank screenshots is intentionally
  // seeded, unsurprisingly, as admin@ffscout.dev — it's the account Manideep
  // checks into before showing this to a pilot organizer.
  await prisma.user.create({
    data: { email: 'admin@ffscout.dev', passwordHash: password, displayName: 'Admin', userType: 'admin', city: 'Hyderabad' },
  });

  const players = [
    ['RushKing_21', 'Rajawadi LAN', 'Heroic', 'fragger', true],
    ['iG_Lx0', 'In association with Vertex gaming co.', 'Master', 'sniper', true],
    ['Koje_Falcon', 'Hyderabad Squad', 'Diamond', 'sniper', true],
    ['Honor_Chur', 'VJIT', 'Diamond', 'support', true],
    ['DeadlyViper', 'Pro Guild', 'Heroic', 'igled', false],
    ['ghost_shivam', 'Invictus Mumbai', 'Silver', 'lurker', false],
  ];
  for (const [name, college, rank, role, verified] of players) {
    await prisma.user.create({
      data: {
        email: `${name.toLowerCase()}@ffscout.dev`,
        passwordHash: password,
        displayName: name,
        userType: 'player',
        college,
        city: 'Hyderabad',
        rank,
        role,
        verified,
        status: 'looking',
      },
    });
  }

  // A realistic organizer: café LAN, not everyone else's catch-all.
  await prisma.user.create({
    data: {
      email: 'org@rajawadilans.dev',
      passwordHash: password,
      displayName: 'Rajawadi LAN',
      userType: 'organizer',
      orgName: 'Rajawadi Cyber Game Nite',
      orgType: 'LAN / gaming café',
      city: 'Hyderabad',
    },
  });

  console.log('seeded');
  await prisma.$disconnect();
}
main();
