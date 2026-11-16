'use strict';

function seededRandom(seed) {
  let state = (Number(seed) || Date.now()) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function shuffled(values, random) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function drawSecretSanta(participants, exclusions = [], options = {}) {
  const names = participants.map((name) => String(name).trim());
  if (names.length < 2) return { ok: false, error: 'At least two participants are required.' };
  if (names.some((name) => !name)) return { ok: false, error: 'Participant names cannot be blank.' };
  if (new Set(names).size !== names.length) return { ok: false, error: 'Participant names must be unique.' };

  const known = new Set(names);
  const blocked = new Set();
  for (const pair of exclusions) {
    if (!Array.isArray(pair) || pair.length !== 2) {
      return { ok: false, error: 'Every exclusion must be a [giver, recipient] pair.' };
    }
    const giver = String(pair[0]);
    const recipient = String(pair[1]);
    if (!known.has(giver) || !known.has(recipient)) {
      return { ok: false, error: 'Unknown name in exclusion: ' + giver + ' -> ' + recipient };
    }
    blocked.add(giver + '\u0000' + recipient);
  }

  const random = seededRandom(options.seed);
  const candidates = new Map(names.map((giver) => [
    giver,
    shuffled(names.filter((recipient) => recipient !== giver && !blocked.has(giver + '\u0000' + recipient)), random),
  ]));

  for (const [giver, allowed] of candidates) {
    if (allowed.length === 0) return { ok: false, error: 'No allowed recipient remains for ' + giver + '.' };
  }

  const recipientToGiver = new Map();
  function assign(giver, seen) {
    for (const recipient of candidates.get(giver)) {
      if (seen.has(recipient)) continue;
      seen.add(recipient);
      const previousGiver = recipientToGiver.get(recipient);
      if (!previousGiver || assign(previousGiver, seen)) {
        recipientToGiver.set(recipient, giver);
        return true;
      }
    }
    return false;
  }

  for (const giver of shuffled(names, random)) {
    if (!assign(giver, new Set())) {
      return { ok: false, error: 'The full set of rules has no complete assignment.' };
    }
  }

  const assignment = Object.fromEntries([...recipientToGiver].map(([recipient, giver]) => [giver, recipient]));
  return { ok: true, assignment };
}

if (require.main === module) {
  const participants = ['Ava', 'Ben', 'Chloe', 'Diego', 'Emi', 'Finn'];
  const exclusions = [
    ['Ava', 'Ben'], ['Ben', 'Ava'],
    ['Chloe', 'Diego'], ['Diego', 'Chloe'],
    ['Emi', 'Finn'], ['Finn', 'Emi'],
  ];
  console.log(JSON.stringify(drawSecretSanta(participants, exclusions, { seed: 2026 }), null, 2));
}

module.exports = { drawSecretSanta };
