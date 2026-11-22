// Dev-only sample board. Never run against a real database.
// Hosts are regular players: posting is open to every account, and there is no
// seeded admin, verifier or paid tier. Accounts here exist so local UI work has
// a roster and a match to look at.
const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');
const { randomBytes } = require('node:crypto');

const prisma = new PrismaClient();

async function main() {
  const plain = process.env.SEED_PASSWORD || randomBytes(12).toString('base64url');
  const password = await hash(plain, 12);
  console.log(`Seed password: ${plain}`);

  const players = [
    ['RushKing_21', 'Heroic', 'rusher', 'RushKing', 'Hyderabad'],
    ['iG_Lx0', 'Elite Master', 'sniper', 'Vertex Gaming', 'Mumbai'],
    ['Koje_Falcon', 'Diamond', 'sniper', 'Falcon Squad', 'Hyderabad'],
    ['Honor_Chur', 'Diamond', 'support', 'VJIT', 'Hyderabad'],
    ['DeadlyViper', 'Heroic', 'anchor', 'Pro Guild', 'Bengaluru'],
    ['ghost_shivam', 'Silver', 'lurker', 'Invictus', 'Mumbai'],
  ];

  const created = [];
  for (const [name, brRank, role, teamName, city] of players) {
    created.push(await prisma.user.create({
      data: {
        email: `${name.toLowerCase()}@example.test`,
        passwordHash: password,
        displayName: name,
        userType: 'player',
        role,
        brRank,
        csRank: brRank,
        teamName,
        city,
        gameUid: null,
        ageConfirmed: true,
      },
    }));
  }

  await prisma.match.create({
    data: {
      organizerId: created[0].id,
      title: 'Sample free entry lobby',
      mode: 'casual',
      gameType: 'BR',
      entry: 'free',
      prize: 'none',
      status: 'open',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      endsAt: new Date(Date.now() + 25.5 * 60 * 60 * 1000),
      city: 'Hyderabad',
      online: true,
      slots: 12,
      contact: 'Discuss the match in the lobby, not in DMs.',
    },
  });

  console.log('seeded dev board; no admin or paid tier');
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
