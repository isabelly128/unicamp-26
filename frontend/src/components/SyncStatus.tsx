import React from 'react';
import { useDevotionStore } from '../stores/devotionStore';
import { useCommunityStore } from '../stores/communityStore';

export const SyncStatus: React.FC<{ visible?: boolean }> = ({ visible = true }) => {
  const devotionSync = useDevotionStore((state) => ({
    remoteStatus: state.remoteStatus,
    remoteError: state.remoteError,
  }));
  const communitySync = useCommunityStore((state) => ({
    remoteStatus: state.remoteStatus,
    remoteError: state.remoteError,
  }));
  const errors = [devotionSync, communitySync]
    .filter((sync) => sync.remoteStatus === 'error')
    .map((sync) => sync.remoteError)
    .filter(Boolean);

  if (!visible || errors.length === 0) return null;

  return (
    <div style={{
      background: 'rgba(220,80,80,0.08)',
      border: '1px solid rgba(220,80,80,0.25)',
      borderRadius: '6px',
      color: '#e07070',
      fontFamily: "'arial black regular',sans-serif",
      fontSize: '12px',
      lineHeight: 1.5,
      marginBottom: '18px',
      padding: '10px 12px',
    }}>
      Supabase sync is not available yet. Edits may stay local until the database setup is complete.
      {errors.length ? ` ${errors.join(' ')}` : ''}
    </div>
  );
};
