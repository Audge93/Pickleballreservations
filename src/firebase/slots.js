import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import { db } from './config';

function playerInList(list, userId) {
  return (list || []).some((p) => p.userId === userId);
}

function getUserLocation(slot, userId) {
  if (playerInList(slot.courtA, userId)) return 'courtA';
  if (playerInList(slot.courtB, userId)) return 'courtB';
  if (playerInList(slot.onDeck, userId)) return 'onDeck';
  return null;
}

function slotCount(slot) {
  return (slot.courtA?.length || 0) + (slot.courtB?.length || 0) + (slot.onDeck?.length || 0);
}

function bothCourtsFull(slot) {
  return (slot.courtA?.length || 0) >= 4 && (slot.courtB?.length || 0) >= 4;
}

function getUserBookingsForDate(allSlots, userId, date) {
  return allSlots.filter((slot) => {
    if (slot.date !== date) return false;
    return playerInList(slot.courtA, userId) || playerInList(slot.courtB, userId) || playerInList(slot.onDeck, userId);
  });
}

function maxConsecutiveRun(bookedOrders, candidateOrder = null) {
  const merged = candidateOrder === null ? [...bookedOrders] : [...bookedOrders, candidateOrder];
  const uniqueSorted = [...new Set(merged)].sort((a, b) => a - b);

  let maxRun = 0;
  let currentRun = 0;
  let last = null;

  for (const order of uniqueSorted) {
    if (last === null || order === last + 1) {
      currentRun += 1;
    } else {
      currentRun = 1;
    }
    maxRun = Math.max(maxRun, currentRun);
    last = order;
  }

  return maxRun;
}

function removeUserEverywhere(slot, userId) {
  return {
    ...slot,
    courtA: (slot.courtA || []).filter((p) => p.userId !== userId),
    courtB: (slot.courtB || []).filter((p) => p.userId !== userId),
    onDeck: (slot.onDeck || []).filter((p) => p.userId !== userId),
  };
}

export function subscribeToSlots(callback, onError) {
  const q = query(collection(db, 'slots'), orderBy('date'), orderBy('order'));
  return onSnapshot(
    q,
    (snapshot) => callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))),
    onError
  );
}

export async function upsertUser(user) {
  const ref = doc(db, 'users', user.id);
  await setDoc(
    ref,
    {
      firstName: user.firstName,
      skillLevel: user.skillLevel,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function bookOrSwitchSlotTransaction({ slotId, destination, user }) {
  const slotRef = doc(db, 'slots', slotId);

  await runTransaction(db, async (transaction) => {
    const slotSnap = await transaction.get(slotRef);
    if (!slotSnap.exists()) {
      throw new Error('This slot no longer exists.');
    }

    const slot = { id: slotSnap.id, ...slotSnap.data() };
    const currentLocation = getUserLocation(slot, user.id);
    const cleanedSlot = removeUserEverywhere(slot, user.id);

    const destinationHasSpace =
      (destination === 'courtA' && (cleanedSlot.courtA?.length || 0) < 4) ||
      (destination === 'courtB' && (cleanedSlot.courtB?.length || 0) < 4) ||
      (destination === 'onDeck' && (cleanedSlot.onDeck?.length || 0) < 4);

    if (!destinationHasSpace) throw new Error('That section is already full.');
    if (destination === 'onDeck' && !bothCourtsFull(cleanedSlot)) {
      throw new Error('On Deck is only available when both courts are full.');
    }

    const sameDayQuery = query(collection(db, 'slots'), where('date', '==', slot.date));
    const sameDaySnap = await transaction.get(sameDayQuery);
    const sameDaySlots = sameDaySnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const userBookingsToday = getUserBookingsForDate(sameDaySlots, user.id, slot.date);
    const alreadyBookedThisSlot = Boolean(currentLocation);

    if (!alreadyBookedThisSlot && userBookingsToday.length >= 4) {
      throw new Error('Daily limit reached. You can only book 2 hours per day.');
    }

    if (!alreadyBookedThisSlot) {
      const bookedOrders = userBookingsToday.map((s) => s.order);
      const nextRun = maxConsecutiveRun(bookedOrders, slot.order);
      if (nextRun > 2) {
        throw new Error('Consecutive limit reached. You can only book 2 back-to-back slots.');
      }
    }

    const player = { userId: user.id, name: user.firstName, level: user.skillLevel };
    const nextSlot = {
      courtA: [...(cleanedSlot.courtA || [])],
      courtB: [...(cleanedSlot.courtB || [])],
      onDeck: [...(cleanedSlot.onDeck || [])],
      updatedAt: serverTimestamp(),
    };

    if (destination === 'courtA') nextSlot.courtA.push(player);
    if (destination === 'courtB') nextSlot.courtB.push(player);
    if (destination === 'onDeck') nextSlot.onDeck.push(player);

    if (slotCount(nextSlot) > 12) throw new Error('This slot is now full.');

    transaction.update(slotRef, nextSlot);
  });
}

export async function cancelBookingTransaction({ slotId, userId }) {
  const slotRef = doc(db, 'slots', slotId);

  await runTransaction(db, async (transaction) => {
    const slotSnap = await transaction.get(slotRef);
    if (!slotSnap.exists()) {
      throw new Error('This slot no longer exists.');
    }

    const slot = { id: slotSnap.id, ...slotSnap.data() };
    const nextSlot = removeUserEverywhere(slot, userId);

    transaction.update(slotRef, {
      courtA: nextSlot.courtA,
      courtB: nextSlot.courtB,
      onDeck: nextSlot.onDeck,
      updatedAt: serverTimestamp(),
    });
  });
}
