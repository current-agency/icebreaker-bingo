import { useState } from 'react';
import { BingoGame } from './components/BingoGame';
import { serverFetch } from './lib/supabase';
import { FONT_SANS, FONT_MONO, monoLabelStyle, pageStyle } from './lib/theme';
import { formatCount } from './lib/bingo';
import { useScoreboardRooms } from './lib/useScoreboardRooms';
import type { RoomSummary, RoomState } from './lib/types';
import logotypeBlue from '../imports/logotype-blue.png';

function ScoreboardRow({ room, rank, currentCode }: { room: RoomSummary; rank: number; currentCode?: string }) {
  const isMe = room.code === currentCode;
  const isLeader = rank === 1 && room.bingo_count > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderRadius: '0.25rem',
        background: isMe ? '#0100FE' : '#FBFCF9',
        color: isMe ? '#FBFCF9' : '#2C2C2C',
        border: isMe ? '1.5px solid #0100FE' : '1.5px solid #C1C2BB',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: 11,
          letterSpacing: '0.06em',
          color: isMe ? 'rgba(251,252,249,0.6)' : '#9A9A9A',
        }}>
          #{rank}
        </span>
        <span style={{ fontFamily: FONT_SANS, fontWeight: 600, fontSize: 16 }}>
          Room {room.code}
        </span>
        {isMe && (
          <span style={{
            fontFamily: FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.2)',
            padding: '2px 6px',
            borderRadius: 4,
          }}>
            You
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isLeader && <span style={{ fontSize: 16 }}>🏆</span>}
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: 12,
          color: isMe ? 'rgba(251,252,249,0.7)' : '#5C5C5C',
        }}>
          {room.cells_completed ?? 0}/24
        </span>
        <span style={{
          fontFamily: FONT_MONO,
          fontSize: 14,
          fontWeight: 700,
          background: isMe ? 'rgba(255,255,255,0.15)' : '#A9FF92',
          color: isMe ? '#FBFCF9' : '#035C4B',
          padding: '2px 10px',
          borderRadius: 999,
          minWidth: 32,
          textAlign: 'center',
        }}>
          {formatCount(room.bingo_count, 'bingo', 'bingos')}
        </span>
      </div>
    </div>
  );
}

function Scoreboard({ currentCode }: { currentCode?: string }) {
  const rooms = useScoreboardRooms();
  if (rooms.length === 0) return null;

  return (
    <div style={{ width: '100%', maxWidth: 480, marginTop: 48 }}>
      <div style={{ ...monoLabelStyle, marginBottom: 12 }}>
        Live Scoreboard
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rooms.map((room, index) => (
          <ScoreboardRow key={room.code} room={room} rank={index + 1} currentCode={currentCode} />
        ))}
      </div>
    </div>
  );
}

function Lobby({ onJoin }: { onJoin: (room: RoomState) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError('Enter a room code to continue.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await serverFetch('/rooms/join', {
        method: 'POST',
        body: JSON.stringify({ code: trimmed }),
      });
      if (!res.ok) throw new Error('Failed to join room');
      onJoin(await res.json());
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      ...pageStyle,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div style={{ marginBottom: 48 }}>
          <img
            src={logotypeBlue}
            alt="Current"
            style={{ height: 18, width: 'auto', display: 'block', marginBottom: 16 }}
          />
          <div style={{ ...monoLabelStyle, fontSize: 12, marginBottom: 8 }}>
            Mandatory Fun
          </div>
          <h1 style={{
            fontFamily: FONT_SANS,
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            color: '#2C2C2C',
            margin: 0,
          }}>
            Icebreaker<br />Bingo
          </h1>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ ...monoLabelStyle, marginBottom: 8 }}>
            Your Breakout Room Number
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="e.g. 3"
              maxLength={12}
              style={{
                flex: 1,
                fontFamily: FONT_SANS,
                fontSize: 20,
                fontWeight: 600,
                color: '#2C2C2C',
                background: '#FBFCF9',
                border: error ? '1.5px solid #d4183d' : '1.5px solid #C1C2BB',
                borderRadius: '0.25rem',
                padding: '12px 16px',
                outline: 'none',
              }}
            />
            <button
              onClick={handleJoin}
              disabled={loading}
              style={{
                fontFamily: FONT_MONO,
                fontSize: 16,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#FBFCF9',
                background: loading ? '#5C5C5C' : '#0100FE',
                border: 'none',
                borderRadius: '0.25rem',
                padding: '12px 24px',
                cursor: loading ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {loading ? 'Joining…' : 'Join →'}
            </button>
          </div>
          {error && (
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: '#d4183d', marginTop: 6 }}>
              {error}
            </div>
          )}
        </div>

        <Scoreboard />
      </div>
    </div>
  );
}

export default function App() {
  const [room, setRoom] = useState<RoomState | null>(null);

  if (!room) {
    return <Lobby onJoin={setRoom} />;
  }

  return <BingoGame initialRoom={room} onLeave={() => setRoom(null)} />;
}
