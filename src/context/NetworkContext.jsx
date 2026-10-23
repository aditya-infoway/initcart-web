import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Network } from '@capacitor/network';

const NetworkContext = createContext({
  isOnline: true,
  serverError: false,
  retry: () => {},
});

export const useNetwork = () => useContext(NetworkContext);

export function NetworkProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true);
  const [serverError, setServerError] = useState(false);

  // Detect internet connection on/off
  useEffect(() => {
    let listener;

    const init = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);

        listener = await Network.addListener('networkStatusChange', (s) => {
          setIsOnline(s.connected);
          if (s.connected) setServerError(false);
        });
      } catch (e) {
        // Browser fallback
        setIsOnline(navigator.onLine);
      }
    };
    init();

    const goOnline = () => {
      setIsOnline(true);
      setServerError(false);
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      listener?.remove();
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Listen for network error events dispatched by axios
  useEffect(() => {
    const onNetworkError = () => setServerError(true);
    window.addEventListener('apiNetworkError', onNetworkError);
    return () => window.removeEventListener('apiNetworkError', onNetworkError);
  }, []);

  // Retry: reload the page (safest way, all components will fetch their data again)
  const retry = useCallback(async () => {
    try {
      const status = await Network.getStatus();
      if (status.connected) {
        setServerError(false);
        setIsOnline(true);
        window.location.reload();
      } else {
        setIsOnline(false);
      }
    } catch (e) {
      if (navigator.onLine) {
        window.location.reload();
      }
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ isOnline, serverError, retry }}>
      {children}
    </NetworkContext.Provider>
  );
}