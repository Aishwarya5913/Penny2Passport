import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getFirestore, doc, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseWebConfig } from "@/lib/firebase-config.functions";
import { demoAccount, emptyAccount, type Account } from "./logic";

type Store = {
  account: Account;
  demo: boolean;
  user: User | null;
  ready: boolean;
  busy: boolean;
  error: string;
  setError: (s: string) => void;
  update: (a: Account) => Promise<void>;
  authenticate: (mode: string, email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  enterDemo: () => void;
};
const Context = createContext<Store | null>(null);
export function PennyProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account>(demoAccount),
    [demo, setDemo] = useState(true),
    [user, setUser] = useState<User | null>(null),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const app = useRef<FirebaseApp | null>(null);
  const savingRef = useRef(false);
  const getConfig = useServerFn(getFirebaseWebConfig);
  useEffect(() => {
    let active = true;
    let stopAuth: (() => void) | undefined;
    let stopData: (() => void) | undefined;
    getConfig()
      .then((result) => {
        if (!active) return;
        if (!result.config) {
          setError(result.error ?? "Firebase configuration is unavailable.");
          setReady(true);
          return;
        }
        app.current = getApps()[0] ?? initializeApp(result.config);
        const firebaseApp = app.current;
        const auth = getAuth(firebaseApp);
        stopAuth = onAuthStateChanged(auth, (u) => {
          stopData?.();
          setUser(u);
          if (u) {
            setDemo(false);
            setAccount(emptyAccount());
            setBusy(true);
            const db = getFirestore(firebaseApp);
            stopData = onSnapshot(
              doc(db, "users", u.uid),
              (snapshot) => {
                if (!active) return;
                setAccount(
                  snapshot.exists()
                    ? (snapshot.data()["account"] as Account)
                    : {
                        ...emptyAccount(),
                        profile: {
                          ...emptyAccount().profile,
                          name: u.displayName ?? "Student",
                          email: u.email ?? "",
                        },
                      },
                );
                setBusy(false);
              },
              () => {
                setBusy(false);
                setError(
                  "Your records could not be loaded. Check Firestore is created and the supplied security rules are published.",
                );
              },
            );
          } else {
            setDemo(true);
            setAccount(demoAccount());
          }
          setReady(true);
        });
      })
      .catch(() => {
        setError("Firebase settings could not be loaded. Please refresh and try again.");
        setReady(true);
      });
    return () => {
      active = false;
      stopAuth?.();
      stopData?.();
    };
  }, [getConfig]);
  useEffect(() => {
    if (!account.profile.analytics || !app.current) return;
    import("firebase/analytics")
      .then(async (m) => {
        if (await m.isSupported()) m.getAnalytics(app.current ?? undefined);
      })
      .catch(() => {});
  }, [account.profile.analytics]);
  async function update(a: Account) {
    if (busy || savingRef.current)
      throw new Error("Please wait until your records finish loading.");
    if (demo) {
      setAccount(a);
      return;
    }
    if (!app.current || !user) throw new Error("Please sign in first.");
    savingRef.current = true;
    setBusy(true);
    try {
      await withDeadline(
        setDoc(doc(getFirestore(app.current), "users", user.uid), {
          account: a,
          updatedAt: serverTimestamp(),
        }),
      );
      setAccount(a);
    } catch {
      throw new Error(
        "Changes were not saved. Check your connection and Firestore security rules.",
      );
    } finally {
      savingRef.current = false;
      setBusy(false);
    }
  }
  async function authenticate(mode: string, email: string, password: string, name: string) {
    if (!app.current) throw new Error("Firebase is not ready. Check the saved web API key.");
    const auth = getAuth(app.current);
    setBusy(true);
    try {
      if (mode === "reset") {
        await sendPasswordResetEmail(auth, email);
        return;
      }
      if (mode === "signup") {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        const data = emptyAccount();
        data.profile.name = name;
        data.profile.email = email;
        await withDeadline(
          setDoc(doc(getFirestore(app.current), "users", result.user.uid), {
            account: data,
            updatedAt: serverTimestamp(),
          }),
        );
      } else await signInWithEmailAndPassword(auth, email, password);
    } catch (e) {
      const code = e && typeof e === "object" && "code" in e ? String(e.code) : "";
      throw new Error(
        code.includes("invalid-credential")
          ? "Email or password is incorrect."
          : code.includes("email-already-in-use")
            ? "This email already has an account. Please sign in."
            : code.includes("operation-not-allowed")
              ? "Enable Email/Password in Firebase Authentication."
              : code.includes("api-key")
                ? "The saved Firebase web API key is invalid."
                : code.includes("permission-denied")
                  ? "Account created, but records could not be saved. Publish the supplied Firestore rules."
                  : code === "save-timeout"
                    ? "Your Firebase account is ready, but saving records timed out. Check that Firestore exists and its access rules are published."
                    : "Could not complete the request. Check your connection and Firebase settings.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (app.current) await signOut(getAuth(app.current));
    setDemo(true);
    setAccount(demoAccount());
  }
  return (
    <Context.Provider
      value={{
        account,
        demo,
        user,
        ready,
        busy,
        error,
        setError,
        update,
        authenticate,
        logout,
        enterDemo: () => {
          if (!user) {
            setDemo(true);
            setAccount(demoAccount());
          }
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
function withDeadline<T>(promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject({ code: "save-timeout" }), 12000);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
export function usePenny() {
  const value = useContext(Context);
  if (!value) throw new Error("PennyProvider is missing");
  return value;
}
