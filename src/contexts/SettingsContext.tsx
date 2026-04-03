import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

interface Settings {
  siteName?: string;
  logo?: string;
  phone?: string;
  email?: string;
  address?: string;
  facebook?: string;
  zalo?: string;
  messenger?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  aboutTitle?: string;
  aboutContent?: string;
  aboutImage?: string;
  partnerLogos?: string[];
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Try to fetch from local JSON first (zero cost)
        const response = await fetch('/data/settings.json');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
          setLoading(false);
          console.log('Settings loaded from JSON cache');
          return; // Skip Firestore listener if JSON is available
        }
      } catch (err) {
        console.log('JSON settings not found, falling back to Firestore');
      }

      // Fallback to Firestore listener
      const q = query(collection(db, 'settings'), limit(1));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as Settings;
          setSettings(data);
        }
        setLoading(false);
      }, (err) => {
        console.error("Error fetching settings from Firestore:", err);
        setError(err.message);
        setLoading(false);
      });

      return unsubscribe;
    };

    let unsubscribe: (() => void) | undefined;
    fetchSettings().then(unsub => {
      if (unsub) unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
