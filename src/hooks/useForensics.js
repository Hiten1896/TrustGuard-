import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

// Vite Environment Audit: Using import.meta.env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app, auth, db;
try {
  if (!getApps().length) {
    if (firebaseConfig.apiKey) {
      app = initializeApp(firebaseConfig);
      auth = getAuth(app);
      db = getFirestore(app);
    } else {
      console.warn('Firebase API Key missing. Forensic repository will be disabled.');
    }
  } else {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (err) {
  console.error('Firebase initialization failed:', err);
}

export function useForensics() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scans, setScans] = useState([]);
  const [activeScan, setActiveScan] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user || !db) {
      setScans([]);
      return;
    }
    try {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setScans(data);
      });
    } catch (err) {
      console.error('Firestore subscription failed:', err);
    }
  }, [user]);

  const saveScan = async (scanData) => {
    if (!user || !db) return;
    try {
      await addDoc(collection(db, 'scans'), {
        ...scanData,
        userId: user.uid,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving scan:', err);
    }
  };

  const login = (email, password) => auth ? signInWithEmailAndPassword(auth, email, password) : Promise.reject('Auth disabled');
  const signup = (email, password) => auth ? createUserWithEmailAndPassword(auth, email, password) : Promise.reject('Auth disabled');
  const logout = () => auth ? signOut(auth) : Promise.resolve();

  return {
    user,
    loading,
    scans,
    activeScan,
    setActiveScan,
    saveScan,
    login,
    signup,
    logout
  };
}
