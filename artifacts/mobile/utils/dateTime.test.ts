import { buildNextDays, formatTimeRangeLabel, joinMeta } from './dateTime';

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const start = new Date('2026-06-20T12:00:00.000Z');
const days = buildNextDays(3, start);

assert(days.length === 3, 'buildNextDays returns requested count');
assert(days[0].label === 'Today', 'first day is Today');
assert(days[1].label === 'Tomorrow', 'second day is Tomorrow');
assert(days[0].iso === '2026-06-20', 'first day has stable ISO date');
assert(formatTimeRangeLabel('20 June 2026', '09:00') === '20 June 2026 at 09:00', 'formats date/time label');
assert(joinMeta(['Clinic', null, '3 km', undefined, 'Open']) === 'Clinic · 3 km · Open', 'joins visible metadata');
