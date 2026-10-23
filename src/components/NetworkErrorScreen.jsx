import React, { useState } from 'react';
import { useNetwork } from '../context/NetworkContext';

export default function NetworkErrorScreen() {
  const { isOnline, serverError, retry } = useNetwork();
  const [loading, setLoading] = useState(false);

  if (isOnline && !serverError) return null;

  const handleRetry = async () => {
    setLoading(true);
    await retry();
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>
        {isOnline ? '⚠️' : '📡'}
      </div>

      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px', color: '#111' }}>
        {isOnline ? 'Unable to connect to the server' : 'No internet connection'}
      </h2>

      <p style={{ color: '#666', marginBottom: '24px', maxWidth: '320px' }}>
        {isOnline
          ? 'Something went wrong. Please try again after some time.'
          : 'Please check your WiFi or mobile data and try again.'}
      </p>

      <button
        onClick={handleRetry}
        disabled={loading}
        style={{
          background: '#f97316',
          color: '#fff',
          border: 'none',
          padding: '12px 32px',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Checking...' : '🔄 Retry'}
      </button>
    </div>
  );
}