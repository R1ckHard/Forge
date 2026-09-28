const CANNED = [
  'Solid reflection. Name one concrete action you will take in the next 24 hours — keep it smaller than you think.',
  'I hear the friction. Before you add more load, protect one recovery block this week and treat it as non-negotiable.',
  'Good signal. Link that feeling back to your session intent: what would “done well” look like in 20 minutes?',
  'That pattern shows up often. Try a 2-minute reset before the next set — breath, posture, then one cue word.',
  'Progress is rarely linear. Capture what worked yesterday and repeat it once before changing the plan.',
];

function hashText(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function fakeCoachReply(text: string, focusLabel: string): string {
  const base = CANNED[hashText(text.toLowerCase()) % CANNED.length];
  return `${base}\n\nOn ${focusLabel}, stay with one focus — quality over volume.`;
}
