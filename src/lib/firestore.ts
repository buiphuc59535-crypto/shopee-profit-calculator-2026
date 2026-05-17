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

const DEMO_CALCULATIONS_KEY = "san-cam-profit-demo-calculations";
const DEMO_FEE_CONFIGS_KEY = "san-cam-profit-demo-fee-configs";
const DEMO_CALCULATIONS_EVENT = "demo-calculations-updated";

export function upsertUserProfile(profile: Omit<UserProfile, "createdAt">) {
  if (!db) return Promise.resolve();
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
  if (!db) {
    const item = {
      ...record,
      id: `demo-${Date.now()}`,
      createdAt: new Date(),
    };
    const records = readDemoCalculations();
    localStorage.setItem(
      DEMO_CALCULATIONS_KEY,
      JSON.stringify([item, ...records].slice(0, 100)),
    );
    window.dispatchEvent(new Event(DEMO_CALCULATIONS_EVENT));
    return Promise.resolve({ id: item.id });
  }
  return addDoc(collection(db, "calculations"), {
    ...record,
    createdAt: serverTimestamp(),
  });
}

export function subscribeCalculations(
  userId: string,
  callback: (records: CalculationRecord[]) => void,
) {
  if (!db) {
    callback(readDemoCalculations().filter((item) => item.userId === userId));
    const handler = () =>
      callback(readDemoCalculations().filter((item) => item.userId === userId));
    window.addEventListener(DEMO_CALCULATIONS_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(DEMO_CALCULATIONS_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }
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
  if (!db) {
    const item = {
      ...config,
      id: `demo-${Date.now()}`,
      createdAt: new Date(),
    };
    const raw = localStorage.getItem(DEMO_FEE_CONFIGS_KEY);
    const records = raw ? (JSON.parse(raw) as FeeConfig[]) : [];
    localStorage.setItem(DEMO_FEE_CONFIGS_KEY, JSON.stringify([item, ...records]));
    return Promise.resolve({ id: item.id });
  }
  return addDoc(collection(db, "fee_configs"), {
    ...config,
    createdAt: serverTimestamp(),
  });
}

function readDemoCalculations(): CalculationRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DEMO_CALCULATIONS_KEY);
    return raw ? (JSON.parse(raw) as CalculationRecord[]) : [];
  } catch {
    return [];
  }
}

