import { useState, useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import logomarkWhite from '../../imports/logomark-white.png';
import { supabase, serverFetch } from '../lib/supabase';
import { FONT_SANS, FONT_MONO, monoButtonStyle, monoLabelStyle, pageStyle } from '../lib/theme';
import {
  FREE_SPACE_INDEX,
  BOARD_SIZE,
  applyCellToggle,
  createConfettiParticles,
  createEmptyNames,
  createInitialClicked,
  formatCount,
  generateRandomCard,
  getWinningCells,
} from '../lib/bingo';
import type { RoomState } from '../lib/types';

const CONFETTI_COLORS = ['#0100FE', '#A9FF92', '#9FDFFE', '#4DE723', '#FBFCF9', '#035C4B'];
const KV_TABLE = 'kv_store_dff036a6';

interface CellStyles {
  bg: string;
  color: string;
  border: string;
  fontWeight: number | string;
  inputBg: string;
  inputColor: string;
  inputPlaceholder: string;
}

function getCellStyles(isFreeSpace: boolean, isWinning: boolean, isClicked: boolean): CellStyles {
  if (isFreeSpace) {
    return {
      bg: '#2C2C2C',
      color: '#E7E8E3',
      border: '1px solid #2C2C2C',
      fontWeight: 700,
      inputBg: 'rgba(0,0,0,0.06)',
      inputColor: '#2C2C2C',
      inputPlaceholder: '#9A9A9A',
    };
  }
  if (isWinning && isClicked) {
    return {
      bg: '#035C4B',
      color: '#A9FF92',
      border: '1px solid #035C4B',
      fontWeight: 700,
      inputBg: 'rgba(169,255,146,0.18)',
      inputColor: '#A9FF92',
      inputPlaceholder: 'rgba(169,255,146,0.5)',
    };
  }
  if (isClicked) {
    return {
      bg: '#0100FE',
      color: '#FBFCF9',
      border: '1px solid #0100FE',
      fontWeight: 700,
      inputBg: 'rgba(255,255,255,0.15)',
      inputColor: '#FBFCF9',
      inputPlaceholder: 'rgba(251,252,249,0.5)',
    };
  }
  return {
    bg: '#FBFCF9',
    color: '#2C2C2C',
    border: '1px solid #C1C2BB',
    fontWeight: 400,
    inputBg: 'rgba(0,0,0,0.06)',
    inputColor: '#2C2C2C',
    inputPlaceholder: '#9A9A9A',
  };
}

interface CellProps {
  text: string;
  isClicked: boolean;
  isFreeSpace: boolean;
  isWinning: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onClick: () => void;
}

function BingoCell({ text, isClicked, isFreeSpace, isWinning, name, onNameChange, onClick }: CellProps) {
  const styles = getCellStyles(isFreeSpace, isWinning, isClicked);
  const hasName = name.trim().length > 0;

  const cellStyle: CSSProperties = {
    background: styles.bg,
    color: styles.color,
    border: styles.border,
    borderRadius: '0.25rem',
    padding: '12px 8px',
    cursor: 'default',
    transition: 'background 0.15s, color 0.15s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    aspectRatio: '1 / 1',
    userSelect: 'none',
    position: 'relative',
  };

  if (isFreeSpace) {
    return (
      <div style={cellStyle}>
        <img
          src={logomarkWhite}
          alt="Current logomark"
          style={{ width: '55%', height: '55%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  return (
    <div style={cellStyle}>
      <span style={{
        fontFamily: FONT_SANS,
        fontSize: '18px',
        fontWeight: styles.fontWeight,
        lineHeight: 1.2,
        textAlign: 'center',
      }}>
        {text}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%', marginTop: 'auto' }}>
        <input
          type="text"
          value={name}
          placeholder="NAME"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onNameChange(e.target.value)}
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: FONT_MONO,
            fontSize: '0.72rem',
            letterSpacing: '0.03em',
            color: styles.inputColor,
            background: styles.inputBg,
            border: 'none',
            borderRadius: 5,
            padding: '3px 6px',
            outline: 'none',
            textAlign: 'center',
          }}
        />
        <button
          onClick={(e) => { e.stopPropagation(); if (hasName) onClick(); }}
          title="Mark as found"
          disabled={!hasName}
          style={{
            flexShrink: 0,
            width: 20,
            height: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
            border: 'none',
            cursor: hasName ? 'pointer' : 'default',
            background: !hasName ? 'rgba(0,0,0,0.1)' : isClicked ? 'rgba(255,255,255,0.2)' : '#0100FE',
            color: !hasName ? 'rgba(0,0,0,0.25)' : isClicked ? styles.inputColor : '#FBFCF9',
            padding: 0,
            transition: 'background 0.15s, color 0.15s',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <polyline points="1.5,6 5,9.5 10.5,2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <style>{`input::placeholder { color: ${styles.inputPlaceholder}; }`}</style>
    </div>
  );
}

function CelebrationOverlay({
  particles,
  bingoCount,
}: {
  particles: { x: number; y: number; rotate: number }[];
  bingoCount: number;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{
            scale: [0, 1.4, 0.9, 0],
            x: particle.x,
            y: particle.y,
            rotate: particle.rotate,
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{ duration: 1.8, delay: i * 0.04, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            width: i % 3 === 0 ? 14 : 10,
            height: i % 3 === 0 ? 14 : 10,
            borderRadius: i % 2 === 0 ? 2 : 999,
            background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.3, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'backOut' }}
        style={{
          position: 'relative',
          zIndex: 10,
          background: '#0100FE',
          color: '#A9FF92',
          borderRadius: 16,
          padding: '32px 56px',
          textAlign: 'center',
          boxShadow: '0 8px 64px rgba(1,0,254,0.5)',
        }}
      >
        <motion.div
          animate={{ rotate: [0, -6, 6, -4, 4, 0] }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontFamily: FONT_SANS,
            fontSize: 'clamp(48px, 8vw, 80px)',
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: '-0.02em',
          }}
        >
          BINGO!
        </motion.div>
        <div style={{
          fontFamily: FONT_MONO,
          fontSize: 14,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#9FDFFE',
          marginTop: 12,
        }}>
          {bingoCount > 1 ? `${bingoCount} lines complete` : 'Line complete'}
        </div>
      </motion.div>
    </div>
  );
}

interface BingoGameProps {
  initialRoom?: RoomState;
  onLeave?: () => void;
}

function applyRemoteRoom(
  remote: RoomState,
  setClicked: (cells: boolean[]) => void,
  setNames: (names: string[]) => void,
  setBingoCount: (count: number) => void,
  setWinning: (winning: boolean[]) => void,
) {
  setClicked(remote.clicked_cells);
  setNames(remote.names);
  setBingoCount(remote.bingo_count);
  setWinning(getWinningCells(remote.clicked_cells));
}

export function BingoGame({ initialRoom, onLeave }: BingoGameProps) {
  const [bingoCard] = useState(() => initialRoom?.card ?? generateRandomCard());
  const [clicked, setClicked] = useState(() => createInitialClicked(initialRoom?.clicked_cells));
  const [winning, setWinning] = useState(() =>
    initialRoom?.clicked_cells ? getWinningCells(initialRoom.clicked_cells) : new Array(BOARD_SIZE).fill(false)
  );
  const [names, setNames] = useState(() => initialRoom?.names ?? createEmptyNames());
  const [bingoCount, setBingoCount] = useState(initialRoom?.bingo_count ?? 0);
  const [celebration, setCelebration] = useState<{ x: number; y: number; rotate: number }[] | null>(null);
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToServer = useCallback((
    nextClicked: boolean[],
    nextNames: string[],
    nextBingoCount: number,
  ) => {
    if (!initialRoom) return;
    if (syncTimeout.current) clearTimeout(syncTimeout.current);
    syncTimeout.current = setTimeout(async () => {
      await serverFetch(`/rooms/${initialRoom.code}`, {
        method: 'PUT',
        body: JSON.stringify({
          clicked_cells: nextClicked,
          names: nextNames,
          bingo_count: nextBingoCount,
        }),
      });
    }, 400);
  }, [initialRoom]);

  useEffect(() => {
    if (!initialRoom) return;
    const channel = supabase
      .channel(`room-${initialRoom.code}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: KV_TABLE,
        filter: `key=eq.room:${initialRoom.code}`,
      }, (payload) => {
        const remote = payload.new?.value as RoomState | undefined;
        if (!remote) return;
        applyRemoteRoom(remote, setClicked, setNames, setBingoCount, setWinning);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [initialRoom]);

  const resetCard = useCallback(() => {
    const nextClicked = createInitialClicked();
    const emptyNames = createEmptyNames();
    setClicked(nextClicked);
    setWinning(new Array(BOARD_SIZE).fill(false));
    setNames(emptyNames);
    syncToServer(nextClicked, emptyNames, bingoCount);
  }, [bingoCount, syncToServer]);

  const updateName = useCallback((index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      syncToServer(clicked, next, bingoCount);
      return next;
    });
  }, [clicked, bingoCount, syncToServer]);

  const toggleCell = useCallback((index: number) => {
    if (index === FREE_SPACE_INDEX) return;
    setClicked((prev) => {
      const result = applyCellToggle(prev, index, bingoCount);
      setWinning(result.winning);
      if (result.gainedLines > 0) {
        setBingoCount(result.bingoCount);
        setCelebration(createConfettiParticles());
      }
      syncToServer(result.next, names, result.bingoCount);
      return result.next;
    });
  }, [bingoCount, names, syncToServer]);

  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 2400);
    return () => clearTimeout(timer);
  }, [celebration]);

  const hasBingo = winning.some(Boolean);

  return (
    <div style={{
      ...pageStyle,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 24px 48px',
      overflowX: 'hidden',
      width: '100%',
    }}>
      <div style={{ width: '100%', maxWidth: 1048, marginBottom: 24, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <div>
            {initialRoom && (
              <div style={{ ...monoLabelStyle, fontSize: 12, marginBottom: 6 }}>
                Room {initialRoom.code}
              </div>
            )}
            <h1 style={{
              fontFamily: FONT_SANS,
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.02em',
              color: '#2C2C2C',
              margin: 0,
            }}>
              Icebreaker Bingo
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            {hasBingo && (
              <div style={{
                background: '#A9FF92',
                color: '#035C4B',
                fontFamily: FONT_MONO,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                borderRadius: 999,
                padding: '6px 16px',
              }}>
                {formatCount(bingoCount, 'Bingo', 'Bingos')}
              </div>
            )}
            <button onClick={resetCard} style={monoButtonStyle('outline')}>
              Reset
            </button>
            {onLeave && (
              <button onClick={onLeave} style={monoButtonStyle('primary')}>
                ← Lobby
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: 1048, position: 'relative', boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gridTemplateRows: 'auto repeat(5, 1fr)',
            gap: 8,
            background: '#FBFCF9',
            borderRadius: '0.75rem',
            padding: 12,
          }}
        >
          {['B', 'I', 'N', 'G', 'O'].map((letter) => (
            <div
              key={letter}
              style={{
                textAlign: 'center',
                fontFamily: FONT_SANS,
                fontSize: 'clamp(22px, 3.5vw, 36px)',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                color: '#0100FE',
                padding: '6px 0',
              }}
            >
              {letter}
            </div>
          ))}
          {bingoCard.map((text, index) => (
            <BingoCell
              key={`${index}-${text}`}
              text={text}
              isClicked={clicked[index]}
              isFreeSpace={index === FREE_SPACE_INDEX}
              isWinning={winning[index]}
              name={names[index] ?? ''}
              onNameChange={(value) => updateName(index, value)}
              onClick={() => toggleCell(index)}
            />
          ))}
        </div>

        {celebration && <CelebrationOverlay particles={celebration} bingoCount={bingoCount} />}
      </div>

      {hasBingo && !celebration && (
        <div style={{
          marginTop: 20,
          fontFamily: FONT_MONO,
          fontSize: 13,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#035C4B',
          fontWeight: 700,
        }}>
          ✓ {formatCount(bingoCount, 'line', 'lines')} complete
        </div>
      )}
    </div>
  );
}
