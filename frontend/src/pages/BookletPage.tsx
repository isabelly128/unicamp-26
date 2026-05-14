import React, { useState } from 'react';

type SessionType = 'session' | 'meal' | 'activity' | 'free' | 'devotion' | 'worship';

interface ScheduleSession {
  time: string;
  title: string;
  description?: string;
  icon: string;
  type: SessionType;
}

interface DaySchedule {
  day: number;
  label: string;
  date: string;
  theme: string;
  verse: string;
  sessions: ScheduleSession[];
}

const SCHEDULE: DaySchedule[] = [
  {
    day: 1,
    label: 'Day 1',
    date: 'Saturday, June 1',
    theme: 'Encountering God',
    verse: 'Isaiah 6:1-8',
    sessions: [
      { time: '2:00 PM',  title: 'Registration & Check-In',   icon: '🏕️', type: 'activity' },
      { time: '3:30 PM',  title: 'Camp Orientation',          description: 'Ground rules, safety briefing, room assignments', icon: '📋', type: 'activity' },
      { time: '4:30 PM',  title: 'Ice Breaker Games',         description: 'Get to know your cabin mates!', icon: '🎮', type: 'activity' },
      { time: '6:00 PM',  title: 'Dinner',                    icon: '🍽️', type: 'meal' },
      { time: '7:30 PM',  title: 'Opening Worship',           description: 'Gathering together before the Lord', icon: '🎵', type: 'worship' },
      { time: '8:15 PM',  title: 'Session 1: The God Who Calls', description: 'Speaker: Pastor David · Isaiah 6:1-8', icon: '📖', type: 'session' },
      { time: '9:30 PM',  title: 'Cell Group Discussion',     description: 'Reflect on the message together', icon: '👥', type: 'activity' },
      { time: '10:30 PM', title: 'Night Devotion',            icon: '🕯️', type: 'devotion' },
      { time: '11:00 PM', title: 'Lights Out',                icon: '🌙', type: 'free' },
    ],
  },
  {
    day: 2,
    label: 'Day 2',
    date: 'Sunday, June 2',
    theme: 'Walking in Faith',
    verse: 'Hebrews 11:1, 6',
    sessions: [
      { time: '7:00 AM',  title: 'Morning Devotion',          description: 'Personal quiet time with God', icon: '🌅', type: 'devotion' },
      { time: '7:45 AM',  title: 'Breakfast',                 icon: '🍳', type: 'meal' },
      { time: '9:00 AM',  title: 'Morning Worship',           icon: '🎵', type: 'worship' },
      { time: '9:30 AM',  title: 'Session 2: Faith Over Fear', description: 'Speaker: Pastor David · Hebrews 11', icon: '📖', type: 'session' },
      { time: '10:45 AM', title: 'Small Group Prayer',        description: 'Pray for one another in groups of 3-4', icon: '🙏', type: 'activity' },
      { time: '12:00 PM', title: 'Lunch',                     icon: '🍱', type: 'meal' },
      { time: '1:30 PM',  title: 'Free & Rec Time',           description: 'Swimming, sports, rest', icon: '🏊', type: 'free' },
      { time: '3:30 PM',  title: 'Workshops',                 description: 'Choose: Evangelism / Spiritual Disciplines / Worship Leading', icon: '🛠️', type: 'activity' },
      { time: '5:30 PM',  title: 'Dinner',                    icon: '🍽️', type: 'meal' },
      { time: '7:30 PM',  title: 'Evening Worship & Ministry Time', icon: '🕊️', type: 'worship' },
      { time: '9:30 PM',  title: 'Cell Group Sharing',        icon: '👥', type: 'activity' },
      { time: '10:30 PM', title: 'Night Devotion',            icon: '🕯️', type: 'devotion' },
      { time: '11:00 PM', title: 'Lights Out',                icon: '🌙', type: 'free' },
    ],
  },
  {
    day: 3,
    label: 'Day 3',
    date: 'Monday, June 3',
    theme: 'Community & Calling',
    verse: '1 Corinthians 12:12-27',
    sessions: [
      { time: '7:00 AM',  title: 'Morning Devotion',          icon: '🌅', type: 'devotion' },
      { time: '7:45 AM',  title: 'Breakfast',                 icon: '🍳', type: 'meal' },
      { time: '9:00 AM',  title: 'Morning Worship',           icon: '🎵', type: 'worship' },
      { time: '9:30 AM',  title: 'Session 3: One Body, Many Parts', description: 'Speaker: Elder James · 1 Cor 12', icon: '📖', type: 'session' },
      { time: '10:45 AM', title: 'Spiritual Gifts Discovery', description: 'Interactive exercise + group discussion', icon: '🎯', type: 'activity' },
      { time: '12:00 PM', title: 'Lunch',                     icon: '🍱', type: 'meal' },
      { time: '1:30 PM',  title: 'Outreach Project',          description: 'Serve the local community together', icon: '❤️', type: 'activity' },
      { time: '4:00 PM',  title: 'Testimony Sharing',         description: 'Campers share what God has done', icon: '🎤', type: 'activity' },
      { time: '5:30 PM',  title: 'Dinner',                    icon: '🍽️', type: 'meal' },
      { time: '7:00 PM',  title: 'Camp Night (Games & Talent Show)', description: 'Laugh, celebrate, and bond!', icon: '🌟', type: 'activity' },
      { time: '9:30 PM',  title: 'Bonfire Worship',           description: 'Outdoor worship around the fire', icon: '🔥', type: 'worship' },
      { time: '11:00 PM', title: 'Lights Out',                icon: '🌙', type: 'free' },
    ],
  },
  {
    day: 4,
    label: 'Day 4',
    date: 'Tuesday, June 4',
    theme: 'Sent & Commissioned',
    verse: 'Matthew 28:18-20',
    sessions: [
      { time: '7:00 AM',  title: 'Morning Devotion',          description: 'Final personal quiet time at camp', icon: '🌅', type: 'devotion' },
      { time: '7:45 AM',  title: 'Breakfast',                 icon: '🍳', type: 'meal' },
      { time: '9:00 AM',  title: 'Closing Worship',           icon: '🎵', type: 'worship' },
      { time: '9:30 AM',  title: 'Session 4: Go — You Are Sent', description: 'Speaker: Pastor David · Matthew 28', icon: '📖', type: 'session' },
      { time: '10:45 AM', title: 'Commitment & Consecration', description: 'Response time — convictions and prayers', icon: '✋', type: 'worship' },
      { time: '11:30 AM', title: 'Cell Group Prayer & Commissioning', description: 'Pray over one another, share commitments', icon: '🙏', type: 'activity' },
      { time: '12:30 PM', title: 'Farewell Lunch',            icon: '🍽️', type: 'meal' },
      { time: '2:00 PM',  title: 'Check-Out',                 description: 'Pack up, say goodbyes', icon: '🏕️', type: 'activity' },
      { time: '3:00 PM',  title: 'Depart',                    icon: '👋', type: 'free' },
    ],
  },
];

const TYPE_COLORS: Record<SessionType, string> = {
  session:  'var(--gold)',
  worship:  '#a0c0a0',
  meal:     '#c0a080',
  activity: '#8090c0',
  devotion: '#c09090',
  free:     'var(--text-muted)',
};

export const BookletPage: React.FC = () => {
  const [activeDay, setActiveDay] = useState(0);
  const day = SCHEDULE[activeDay];

  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            color: 'var(--text-primary)',
            margin: '0 0 8px',
          }}
        >
          📖 Camp Booklet
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
          4 Days · 3 Nights · June 1–4, 2024
        </p>
      </div>

      {/* Day Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {SCHEDULE.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(i)}
            style={{
              padding: '10px 20px',
              borderRadius: '100px',
              border: '1px solid',
              borderColor: activeDay === i ? 'var(--gold)' : 'var(--border)',
              background: activeDay === i ? 'rgba(212,165,90,0.15)' : 'transparent',
              color: activeDay === i ? 'var(--gold)' : 'var(--text-muted)',
              fontSize: '13px',
              fontWeight: activeDay === i ? 700 : 400,
              cursor: 'pointer',
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Day Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212,165,90,0.12), rgba(160,130,100,0.06))',
          border: '1px solid rgba(212,165,90,0.2)',
          borderRadius: '16px',
          padding: '28px',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            letterSpacing: '0.12em',
            color: 'var(--gold)',
            fontWeight: 600,
            textTransform: 'uppercase',
            marginBottom: '8px',
          }}
        >
          {day.date}
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '26px',
            color: 'var(--text-primary)',
            margin: '0 0 4px',
          }}
        >
          {day.theme}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
          Key Verse: {day.verse}
        </p>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', paddingLeft: '24px' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '8px',
            bottom: '8px',
            width: '2px',
            background: 'linear-gradient(to bottom, var(--gold), transparent)',
            opacity: 0.3,
          }}
        />
        {day.sessions.map((session, i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', marginBottom: '14px', position: 'relative' }}>
            {/* Dot */}
            <div
              style={{
                position: 'absolute',
                left: '-28px',
                top: '14px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: TYPE_COLORS[session.type],
                border: '2px solid var(--card-bg)',
                flexShrink: 0,
              }}
            />
            {/* Time */}
            <div
              style={{
                minWidth: '68px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                paddingTop: '12px',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {session.time}
            </div>
            {/* Card */}
            <div
              style={{
                flex: 1,
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '12px 16px',
                borderLeft: `3px solid ${TYPE_COLORS[session.type]}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: session.description ? '4px' : 0 }}>
                <span style={{ fontSize: '17px' }}>{session.icon}</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {session.title}
                </span>
              </div>
              {session.description && (
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, paddingLeft: '25px' }}>
                  {session.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
          marginTop: '32px',
          padding: '20px',
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        }}
      >
        {(Object.entries(TYPE_COLORS) as [SessionType, string][]).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
            <span style={{ textTransform: 'capitalize' }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
