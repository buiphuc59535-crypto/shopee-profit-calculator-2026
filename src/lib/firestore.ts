import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CalculationRecord, FeeConfig, UserProfile } from "@/types/domain";

export function upsertUserProfile(profile: Omit<UserProfile, "createdAt">) {
  return setDoc(
    doc(db, "users", profile.uid),
    {
      ...profile,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export function saveCalculation(
  record: Omit<CalculationRecord, "id" | "createdAt">,
) {
  return addDoc(collection(db, "calculations"), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

export function subscribeCalculations(
  userId: string,
  callback: (records: CalculationRecord[]) => void,
) {
  const ref = query(
    collection(db, "calculations"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(100),
  );

  return onSnapshot(ref, (snapshot) => {
    callback(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<CalculationRecord, "id">),
      })),
    );
  });
}

export function saveFeeConfig(config: Omit<FeeConfig, "id" | "createdAt">) {
  return addDoc(collection(db, "fee_configs"), {
    ...config,
    createdAt: serverTimestamp(),
  });
}
