// Single source for /learn, the field manual for Indian Free Fire organizers
// and players. Game facts below reflect the live game as of late 2026
// (OB55), cross-checked against multiple community guides and official patch
// notes. Numbers are omitted where sources conflict, roles and mechanics
// matter more than exact ratios for a verification service.

export interface LearnLink {
  label: string;
  href: string;
  where: 'official' | 'community' | 'video';
}

export interface Chapter {
  id: string;
  tag: 'DRILL' | 'INTEL' | 'PLAYBOOK' | 'SOURCES' | 'DISCIPLINE';
  title: string;
  brief: string;
  blocks: { heading?: string; lines: string[] }[];
  links?: LearnLink[];
}

export const LEARN_CHAPTERS: Chapter[] = [
  {
    id: 'screenshot',
    tag: 'DRILL',
    title: 'A screenshot that passes',
    brief: 'What the verification admin actually needs to see, and how to capture it in 30 seconds.',
    blocks: [
      {
        heading: 'What the admin looks at',
        lines: [
          'Open the screen that shows your rank and your ADPR (kill/death) together, the one the game shows you after a ranked match.',
          'Your UID must be visible somewhere on the screen (profile page works).',
          'The capture should be one image, unedited, uncropped.',
        ],
      },
      {
        heading: 'How to take it',
        lines: [
          'Finish a ranked match. On the results screen, look for your rank chip and match statistics.',
          'Screenshot in-game (volume + power on Android). Do not open it in an editor. Do not retake with different settings.',
          'If you received an ADPR banner or clan invite before the shot, fine, but ADPR/KD and rank must both be readable.',
        ],
      },
      {
        heading: 'Why shots get rejected',
        lines: [
          'Cropped, UID or timestamp cut off.',
          'Smoothed / re-saved through an editor, metadata stripped or image tampered with.',
          'Wrong page, lobby screen instead of your stats.',
          'A screenshot of someone else\u2019s screen, or a leaked pro\u2019s crop from social media.',
        ],
      },
    ],
  },
  {
    id: 'roles',
    tag: 'INTEL',
    title: 'The five combat roles',
    brief: 'What each role means, what organizers check, and why IGL is not on this list.',
    blocks: [
      {
        heading: 'Rusher, entry',
        lines: [
          'First in every fight. M1887 / M1014 with a nade. Organisers check: entry timing, knock-per-round, how often you survive a traded engage.',
        ],
      },
      {
        heading: 'AWM Sniper, long range',
        lines: [
          'Holds the longest sightline. AWM + 6x scope. Organisers check: headshot rate, ADPR specifically in long-range skirmishes.',
        ],
      },
      {
        heading: 'Support, sustain',
        lines: [
          'M1014 + gloo walls + medkit. Keeps the squad standing through the mid-game. Organisers check: revives per match, not kills.',
        ],
      },
      {
        heading: 'Anchor, positional',
        lines: [
          'Holds lanes and late-game angles. XM8 / AK-47. Never the first in. Organisers check: endgame survivability, how late in the circle you died.',
        ],
      },
      {
        heading: 'Lurker, off-angle',
        lines: [
          'Works split from the squad. Mini14 / Dragunov. Organisers check: flank kills in late circle, whether your quiet games were wins.',
        ],
      },
      {
        heading: 'And IGL?',
        lines: [
          'IGL is a designation, not a role, one player per squad (usually the most experienced) makes the rotation calls and the final call. An IGL still plays one of the five above.',
          'On Final Circle, players can tag "I can IGL" as a capability at sign-up. It is an unverified self-declaration, real verification comes from shortlist captain review, not a checkbox.',
        ],
      },
    ],
  },
  {
    id: 'characters',
    tag: 'INTEL',
    title: 'Characters that matter',
    brief: 'The ability kits behind each role. Your on-screen character is cosmetic, the skills in your preset are what win.',
    blocks: [
      {
        heading: 'How loadouts work',
        lines: [
          'You own characters, each with one ability (active or passive). Your preset holds ONE active + THREE passives, taken from any character you own.',
          'Wearing Alok on screen does not lock you to his skill; pick whoever fits the role.',
          'Active skills have cooldowns; passives are always on. Plan one active + three passives per role you actually play.',
        ],
      },
      {
        heading: 'Alok, Drop the Beat (Active)',
        lines: [
          'Healing + movement-speed aura. Still the most-picked active for pushing and post-fight recovery. Rushers and frontliners run it.',
        ],
      },
      {
        heading: 'K, Master of All (Active)',
        lines: [
          'Maximum EP + two modes: Jiu-jitsu (allies convert EP to HP faster) and Psychology (personal EP regen). The squad-sustain backbone.',
        ],
      },
      {
        heading: 'Chrono, Time Turner (Active)',
        lines: [
          'A force field that blocks incoming damage for a few seconds, revive cover, reload cover, anti-rush cover. Defenders and anchors run it.',
        ],
      },
      {
        heading: 'Skyler, Riptide Rhythm (Active)',
        lines: [
          'Sonic wave that destroys enemy Gloo Walls in front of him, and his own Gloo Wall heal scales off walls damaged. The anti-turtle pick.',
        ],
      },
      {
        heading: 'Wukong, Camouflage (Active)',
        lines: [
          'Becomes a bush for a short time. Ambush opener / escape tool. Cooldown reduced to 75s in OB55.',
        ],
      },
      {
        heading: 'Dimitri, Healing Heartbeat (Active)',
        lines: [
          'A healing zone where knocked teammates revive themselves. Revive-security for support-minded squads.',
        ],
      },
      {
        heading: 'Leon, Buzzer Beater (Passive)',
        lines: ['Recovers HP after surviving a fight. Saves one medkit per fight; adds up in a tournament series.'],
      },
      {
        heading: 'Jota, Sustained Raids (Passive)',
        lines: ['Regains HP for each enemy knocked. Scales with aggression, the rusher\u2019s passive.'],
      },
      {
        heading: 'Hayato, Art of Blades (Passive)',
        lines: ['Gains armor penetration as HP drops. Two-tap endings in close fights.'],
      },
      {
        heading: 'Maro, Falcon Fervor (Passive)',
        lines: ['Damage increases with distance to the target, the sniper\u2019s passive. Exact numbers change with balance patches; the mechanic is stable.'],
      },
      {
        heading: 'Rafael, Dead Silent (Passive)',
        lines: ['Shots are silenced while scoped. Opponents cannot pinpoint your position, the AWM pick for tournaments.'],
      },
      {
        heading: 'Clu, Tracing Steps (Active)',
        lines: ['Reveals nearby enemies\u2019 locations periodically. The safest information skill in the game for anchors and snipers.'],
      },
      {
        heading: 'How to unlock',
        lines: [
          'Most paid characters cost Diamonds; a few arrive as free anniversary/top-up event rewards; the two starters (Primis, Nulla) are free.',
          'Check the Character menu in-game, prices and event rotations change with every OB update.',
        ],
      },
    ],
  },
  {
    id: 'maps',
    tag: 'INTEL',
    title: 'Maps, what plays where',
    brief: 'Five active maps after OB54. Bermuda 2.0 and Alpine are gone. Know the map before picking the drop.',
    blocks: [
      {
        heading: 'Bermuda',
        lines: [
          'The original, all-rounder BR and CS map. Balanced sightlines, something for every role. If you learn one map for verification screenshots, learn this one, it is also what most Indian scrims run.',
        ],
      },
      {
        heading: 'Purgatory',
        lines: [
          'Rural, rivers and bridges, open middle with long sightlines. Favours snipers and patient rotations over dryrushes.',
        ],
      },
      {
        heading: 'Kalahari',
        lines: [
          'Compact desert with verticality. Fights happen fast; expect to take two gunfights before the first zone closes. No ziplines in CS after OB54.',
        ],
      },
      {
        heading: 'NexTerra',
        lines: [
          'Futuristic vertical map with portals and zero-gravity mechanics. Reading the map matters more than raw aim here, drop early and scout.',
        ],
      },
      {
        heading: 'Solara',
        lines: [
          'Port city on rails, fast rotations, newest map. Slide rails make flanks possible from odd angles; rehearse the drop with your squad before a rated scrim.',
        ],
      },
      {
        heading: 'Removed or rotating',
        lines: [
          'Bermuda Remastered (2.0) and Alpine were removed in OB54 (June 2026). Map pools rotate with updates, events and season mode, always check the in-game selector. FFWS 2026 map rotation (Brazil): Bermuda, Purgatory, NexTerra, Kalahari, Solara.',
        ],
      },
    ],
  },
  {
    id: 'combos',
    tag: 'INTEL',
    title: 'Skill combos that win',
    brief: 'Community-tested presets by role. Start here, then adjust to your own playstyle.',
    blocks: [
      {
        heading: 'Rusher, the classic',
        lines: [
          'Alok (Drop the Beat) + Jota (Sustained Raids) + Kelly (Deadly Velocity) + Hayato (Art of Blades). Aggressive entries, heals on Alok, HP back on every knock, speed + armor pen into the first trade.',
        ],
      },
      {
        heading: 'Sniper, tournament AWM',
        lines: [
          'Clu (Tracing Steps) + Maro (Falcon Fervor) + Rafael (Dead Silent) + Laura (Sharp Shooter). Full info, silent scoped shots, far-target damage, scoped accuracy.',
        ],
      },
      {
        heading: 'Support, keep the push alive',
        lines: [
          'Dimitri (Healing Heartbeat) + Kapella (Remedy Rounds) + Thiva (Vital Vibes) + Alok or K (sustain). Revive is the outcome; everything else is setup.',
        ],
      },
      {
        heading: 'Anchor / defender, hold the angle',
        lines: [
          'Chrono (Time Turner) + Nairi (Ice Iron, buffs gloo walls) + Alok + Leon (Buzzer Beater). Survive the collapse, then punish.',
        ],
      },
      {
        heading: 'Wall-breaker, anti-turtle',
        lines: [
          'Skyler (Riptide Rhythm) + Nero / Ignis (cryo/heat wall-breakers) + Tatsuya (Rebel Rush) + Jota. For squads that keep losing to massed gloo walls.',
        ],
      },
      {
        heading: 'Honesty note',
        lines: [
          'Combos are starting points, not commandments, character numbers change every OB update. If a guide quotes exact percentages, check whether it was written for your patch.',
        ],
      },
    ],
  },
  {
    id: 'playbook',
    tag: 'PLAYBOOK',
    title: 'Running a verified scrim',
    brief: 'A field checklist for organizers: before the slot opens, on match day, after the win.',
    blocks: [
      {
        heading: 'Before you open slots',
        lines: [
          'Pick the exact roles you need, a roster is rarely 5 rushers. Write the roster slot by slot.',
          'Decide the rank floor. Below Heroic for fests and GBV qualifiers, below Diamond for casual; Heroic+ only if you need the ceiling.',
          'Decide the refund line up front: refund until roster locks, never after.',
        ],
      },
      {
        heading: 'Match day',
        lines: [
          'Check-in with UID visible, no screenshot, no slot, no debate.',
          'Warmups run 15 minutes before the first match. No-show in warmup = slot re-opened.',
          'Winners stay in voice; losers get a polite exit. No mid-match coaching.',
        ],
      },
      {
        heading: 'After the result',
        lines: [
          'Rate each shortlisted player 1–5. Tell Final Circle if anyone lied about role or rank, that player is removed from the pool permanently.',
          'If the roster genuinely failed you, email for the refund before the next event cycle.',
        ],
      },
    ],
  },
  {
    id: 'sources',
    tag: 'SOURCES',
    title: 'Sources worth your time',
    brief: 'Official channels and community references, labelled honestly. No fabricated ABRs, no scraped coaching secrets.',
    links: [
      { label: 'Garena, Free Fire global portal', href: 'https://ff.garena.com/en/', where: 'official' },
      { label: 'Garena, character index (official)', href: 'https://ff.garena.com/en/chars/', where: 'official' },
      { label: 'Garena support, account, purchase, reporting issues', href: 'https://support.garena.com/', where: 'official' },
      { label: 'Search: Free Fire India official YouTube channel', href: 'https://www.youtube.com/results?search_query=Free+Fire+India+Official', where: 'video' },
      { label: 'Search: FFIC (Free Fire India Championship) results & VODs', href: 'https://www.youtube.com/results?search_query=FFIC+results', where: 'video' },
      { label: 'Search: ADPR explained (Free Fire India)', href: 'https://www.youtube.com/results?search_query=free+fire+ADPR+explained', where: 'video' },
      { label: 'Search: role guides for ranked (rusher, support, anchor)', href: 'https://www.youtube.com/results?search_query=free+fire+role+guide+rusher+support+anchor', where: 'video' },
      { label: 'Free Fire Nation, Indian FF news & guides', href: 'https://www.freefirenation.com/', where: 'community' },
      { label: 'Free Fire Hub, news, events & guides', href: 'https://freefirehub.com/', where: 'community' },
      { label: 'GuruGamer, esports strategy & coordination guides', href: 'https://www.gurugamer.com/', where: 'community' },
      { label: 'Eneba Hub, Free Fire esports reference (rosters, roles, FFIC context)', href: 'https://www.eneba.com/hub/games/free-fire-esports/', where: 'community' },
      { label: 'GamerFlick, Indian mobile esports platform', href: 'https://www.gamerflick.in/', where: 'community' },
    ],
    blocks: [
      {
        heading: 'How to read a source',
        lines: [
          'Official Garena pages tell you what the game guarantees. Community sites tell you what works in practice. Garena will never post strategy, that\u2019s the community\u2019s job.',
          'Be suspicious of any guide that quotes exact ADPR thresholds with false precision, those are coaching opinions, not Garena rules.',
        ],
      },
    ],
  },
  {
    id: 'discipline',
    tag: 'DISCIPLINE',
    title: 'Don\u2019t get played',
    brief: 'The three fraud patterns that show up most in Indian FF grassroots, and how Final Circle blocks them.',
    blocks: [
      {
        heading: 'Boosted accounts',
        lines: [
          'A friend\u2019s Heroic pushed on your account last month; your Gold this month is your real skill. Final Circle cannot catch this, but organizers who see your match history can.',
        ],
      },
      {
        heading: 'Shared screenshots',
        lines: [
          'The same ADPR image circulating in five WhatsApp groups. Final Circle verifiers eye-check screenshots for obvious reuse, but if someone asks you to \u201cshare your rank SS to get verified,\u201d that is not Final Circle. We never contact you first. Email manideepdaram@gmail.com if you see such a message.',
        ],
      },
      {
        heading: 'Paying for verification',
        lines: [
          'Final Circle charges organizers ₹499 per event. Players never pay. Anyone asking you for money to \u201cspeed up verification\u201d is scamming you. Report it, we remove them from the pool permanently.',
        ],
      },
    ],
  },
];
