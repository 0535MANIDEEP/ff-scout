// Seed demo data. Do NOT run against any real database — it creates fake
// players with a shared demo password. Dev scratch only.
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await hash('ffscout-admin-demo', 10);
  // Demo credentials — every seeded account uses 'ffscout-admin-demo'.
  // Never point this at a real DB. Prod admin lives in production only.

  // The admin who is allowed to verify rank screenshots is intentionally
  // seeded, unsurprisingly, as admin@ffscout.dev — it's the account Manideep
  // checks into before showing this to a pilot organizer.
  await prisma.user.create({
    data: { email: 'admin@ffscout.dev', passwordHash: password, displayName: 'Admin', userType: 'admin', city: 'Hyderabad' },
  });

  const players = [
    ['RushKing_21', 'Rajawadi LAN', 'Heroic', 'rusher', true],
    ['iG_Lx0', 'In association with Vertex gaming co.', 'Elite Master', 'sniper', true],
    ['Koje_Falcon', 'Hyderabad Squad', 'Diamond', 'sniper', true],
    ['Honor_Chur', 'VJIT', 'Diamond', 'support', true],
    ['DeadlyViper', 'Pro Guild', 'Heroic', 'anchor', false],
    ['ghost_shivam', 'Invictus Mumbai', 'Silver', 'lurker', false],
  ];
  for (const [name, college, rank, role, verified] of players) {
    await prisma.user.create({
      data: {
        email: `${name.toLowerCase()}@example.com`,
        passwordHash: password,
        displayName: name,
        userType: 'player',
        role,
        rank,
        college,
        verified,
        status: 'looking',
        iglCapable: ['iG_Lx0', 'DeadlyViper'].includes(name),
      },
    });
  }

  await prisma.user.create({
    data: {
      email: 'rajawadi@example.com',
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
