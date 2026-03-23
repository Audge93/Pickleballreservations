import fs from 'node:fs';
import process from 'node:process';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-service-account.json';
if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Service account file not found at ${serviceAccountPath}`);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const baseDates = [
  '2026-03-23',
  '2026-03-24',
  '2026-03-25',
  '2026-03-26',
  '2026-03-27',
  '2026-03-28',
  '2026-03-29',
];

function formatHour(hour24) {
  const suffix = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return { hour12, suffix };
}

function makeTimeLabel(startHour, startMinute, endHour, endMinute) {
  const s = formatHour(startHour);
  const e = formatHour(endHour);
  const startMin = String(startMinute).padStart(2, '0');
  const endMin = String(endMinute).padStart(2, '0');
  return `${s.hour12}:${startMin}–${e.hour12}:${endMin} ${e.suffix}`;
}

function makeTimeKey(hour, minute) {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function generateDailySlots(date) {
  const slots = [];
  let hour = 6;
  let minute = 0;
  let index = 1;

  while (!(hour === 19 && minute === 0)) {
    let endHour = hour;
    let endMinute = minute + 30;
    if (endMinute >= 60) {
      endMinute = 0;
      endHour += 1;
    }

    slots.push({
      id: `${date}_slot_${index}`,
      date,
      timeKey: makeTimeKey(hour, minute),
      timeLabel: makeTimeLabel(hour, minute, endHour, endMinute),
      startHour: hour,
      startMinute: minute,
      order: index - 1,
      courtA: [],
      courtB: [],
      onDeck: [],
      updatedAt: FieldValue.serverTimestamp(),
    });

    hour = endHour;
    minute = endMinute;
    index += 1;
  }

  return slots;
}

function addPlayer(userId, name, level) {
  return { userId, name, level };
}

function seedFirstDay(slots) {
  return slots.map((slot) => {
    if (slot.date !== '2026-03-23') return slot;

    if (slot.timeKey === '06:30') {
      return {
        ...slot,
        courtA: [
          addPlayer('user_alex', 'Alex', 'Intermediate'),
          addPlayer('user_sam', 'Sam', 'Advanced'),
        ],
      };
    }

    if (slot.timeKey === '07:00') {
      return {
        ...slot,
        courtA: [
          addPlayer('user_alex', 'Alex', 'Intermediate'),
          addPlayer('user_jamie', 'Jamie', 'Beginner'),
          addPlayer('user_taylor', 'Taylor', 'Advanced'),
          addPlayer('user_morgan', 'Morgan', 'Intermediate'),
        ],
        courtB: [
          addPlayer('user_chris', 'Chris', 'Beginner'),
          addPlayer('user_jordan', 'Jordan', 'Advanced'),
          addPlayer('user_casey', 'Casey', 'Intermediate'),
          addPlayer('user_drew', 'Drew', 'Advanced'),
        ],
      };
    }

    if (slot.timeKey === '07:30') {
      return {
        ...slot,
        courtA: [
          addPlayer('user_alex', 'Alex', 'Intermediate'),
          addPlayer('user_jamie', 'Jamie', 'Beginner'),
          addPlayer('user_taylor', 'Taylor', 'Advanced'),
          addPlayer('user_morgan', 'Morgan', 'Intermediate'),
        ],
        courtB: [
          addPlayer('user_chris', 'Chris', 'Beginner'),
          addPlayer('user_jordan', 'Jordan', 'Advanced'),
          addPlayer('user_casey', 'Casey', 'Intermediate'),
          addPlayer('user_drew', 'Drew', 'Advanced'),
        ],
        onDeck: [
          addPlayer('user_pat', 'Pat', 'Intermediate'),
          addPlayer('user_lee', 'Lee', 'Beginner'),
          addPlayer('user_sky', 'Sky', 'Advanced'),
          addPlayer('user_jules', 'Jules', 'Intermediate'),
        ],
      };
    }

    if (slot.timeKey === '08:00') {
      return {
        ...slot,
        courtB: [addPlayer('user_avery', 'Avery', 'Beginner')],
      };
    }

    if (slot.timeKey === '14:00') {
      return {
        ...slot,
        courtA: [
          addPlayer('user_nina', 'Nina', 'Intermediate'),
          addPlayer('user_owen', 'Owen', 'Advanced'),
          addPlayer('user_mia', 'Mia', 'Beginner'),
          addPlayer('user_noah', 'Noah', 'Intermediate'),
        ],
        courtB: [
          addPlayer('user_ivy', 'Ivy', 'Beginner'),
          addPlayer('user_mason', 'Mason', 'Intermediate'),
          addPlayer('user_luca', 'Luca', 'Advanced'),
          addPlayer('user_ella', 'Ella', 'Intermediate'),
        ],
        onDeck: [addPlayer('user_theo', 'Theo', 'Beginner')],
      };
    }

    return slot;
  });
}

async function main() {
  const slots = seedFirstDay(baseDates.flatMap((date) => generateDailySlots(date)));
  const batchSize = 50;

  for (let i = 0; i < slots.length; i += batchSize) {
    const chunk = slots.slice(i, i + batchSize);
    const batch = db.batch();
    chunk.forEach((slot) => {
      const ref = db.collection('slots').doc(slot.id);
      batch.set(ref, slot, { merge: true });
    });
    await batch.commit();
  }

  console.log(`Seeded ${slots.length} slot documents into Firestore.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
