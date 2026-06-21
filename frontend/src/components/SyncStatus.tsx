import React from 'react';
import { useDevotionStore } from '../stores/devotionStore';

export const SyncStatus: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const { remoteStatus, remoteError } = useDevotionStore((state) => ({
    remoteStatus: state.remoteStatus,
    remoteError: state.remoteError,
  }));

  if (!visible || remoteStatus !== 'error') return null;

  return (
    <div style={{
      background: 'rgba(220,80,80,0.08)',
      border: '1px solid rgba(220,80,80,0.25)',
      borderRadius: '6px',
      color: '#e07070',
      fontFamily: "'Barlow',sans-serif",
      fontSize: '12px',
      lineHeight: 1.5,
      marginBottom: '18px',
      padding: '10px 12px',
    }}>
      Supabase sync is not available yet. Edits may stay local until the database setup is complete.
      {remoteError ? ` ${remoteError}` : ''}
    </div>
  );
};
