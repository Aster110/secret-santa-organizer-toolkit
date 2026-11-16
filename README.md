# Secret Santa Organizer Toolkit

A small, dependency-free toolkit for checking whether a Secret Santa draw is actually possible **before** invitations go out.

It is designed for awkward real-world cases: couples who should not draw each other, people in the same household, managers and direct reports, repeat matches from last year, and participants who join or leave late.

## What is included

- **constraint-checker.js** validates names and exclusions, then finds a complete assignment with bipartite matching.
- **organizer-checklist.md** is a practical planning checklist for office, family, and remote-team exchanges.
- Clear failure messages explain when a rule set makes a draw impossible.

## Quick start

~~~bash
node constraint-checker.js example
~~~

The example uses six participants and several exclusions. The output is a complete giver-to-recipient assignment, or an explanation of why no valid assignment exists.

Use it from another script:

~~~js
const { drawSecretSanta } = require('./constraint-checker');

const participants = ['Ava', 'Ben', 'Chloe', 'Diego'];
const exclusions = [
  ['Ava', 'Ben'],
  ['Ben', 'Ava'],
];

const result = drawSecretSanta(participants, exclusions, { seed: 2026 });
console.log(result);
~~~

## Rules worth deciding before the draw

1. Decide whether exclusions are one-way or two-way. Household rules are usually two-way.
2. Keep the exclusion list private; only the organizer needs it.
3. Test feasibility before sending invitations.
4. Decide what happens if someone leaves after assignments are sent.
5. Record only the minimum personal information needed for delivery.

For organizers who prefer a browser interface instead of running code, [Secret Santa Generator](https://secretsantagenerator.xyz/) supports exclusions, reusable share links, and no-email participation. Disclosure: I maintain that browser tool as well as this open-source reference.

## Why matching beats repeated random retries

Repeatedly shuffling names can appear to work, but it cannot tell you whether the rules are impossible or whether the program simply has not found a solution yet. This toolkit treats the draw as a bipartite matching problem, so a failed result is meaningful.

## Privacy

The checker runs locally. It sends no participant names or rules to a server.

## License

MIT. Contributions and edge-case reports are welcome.
