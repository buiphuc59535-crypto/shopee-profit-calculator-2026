"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { upsertUserProfile } from "@/lib/firestore";

type AuthContextValue = {
  user: User | DemoUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  firebaseReady: boolean;
  demoMode: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type DemoUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
};

const demoUser: DemoUser = {
  uid: "demo-user",
  email: "demo@seller.local",
  displayName: "Demo Seller",
  photoURL: null,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | DemoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setUser(demoUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await upsertUserProfile({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          avatar: currentUser.photoURL,
        });
      }
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (!auth) {
      setUser(demoUser);
      return;
    }
    await signInWithPopup(auth, googleProvider);
  }, []);

  const logout = useCallback(async () => {
    if (!auth) {
      setUser(demoUser);
      return;
    }
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
      firebaseReady: isFirebaseConfigured,
      demoMode: !isFirebaseConfigured,
    }),
    [loading, loginWithGoogle, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
