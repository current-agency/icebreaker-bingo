import { useMemo, useState } from 'react';
import { usePublishedResults } from '../lib/usePublishedResults';
import { FONT_SANS, FONT_MONO, monoButtonStyle, monoLabelStyle, pageStyle } from '../lib/theme';
import type { AnalyticsSummary, PromptStat } from '../lib/types';
import logotypeBlue from '../../imports/logotype-blue.png';

interface ResultsAnalyticsProps {
  onBack: () => void;
}

function ParticipantBarChart({ participants, maxBars = 12 }: { participants: AnalyticsSummary['participants']; maxBars?: number }) {
  const top = participants.slice(0, maxBars);
  const maxCount = top[0]?.count ?? 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {top.map((participant, index) => (
        <div key={participant.name} style={{ display: 'grid', gridTemplateColumns: '28px 120px 1fr 36px', gap: 12, alignItems: 'center' }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#9A9A9A' }}>{index + 1}</span>
          <span style={{
            fontFamily: FONT_SANS,
            fontSize: 14,
            fontWeight: 600,
            color: '#2C2C2C',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {participant.name}
          </span>
          <div style={{ background: '#E7E8E3', borderRadius: 4, height: 24, overflow: 'hidden' }}>
            <div style={{
              width: `${(participant.count / maxCount) * 100}%`,
              height: '100%',
              background: index === 0 ? '#0100FE' : '#035C4B',
              borderRadius: 4,
            }} />
          </div>
          <span style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: '#2C2C2C', textAlign: 'right' }}>
            {participant.count}
          </span>
        </div>
      ))}
    </div>
  );
}

function PromptBreakdown({ prompts }: { prompts: PromptStat[] }) {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return prompts;
    return prompts.filter((item) =>
      item.prompt.toLowerCase().includes(query)
      || item.entries.some((entry) => entry.name.toLowerCase().includes(query)),
    );
  }, [prompts, search]);

  if (prompts.length === 0) {
    return (
      <p style={{ fontFamily: FONT_SANS, color: '#5C5C5C', margin: 0 }}>
        No completed prompts found.
      </p>
    );
  }

  return (
    <div>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search prompts or names…"
        style={{
          width: '100%',
          fontFamily: FONT_SANS,
          fontSize: 14,
          color: '#2C2C2C',
          background: '#FBFCF9',
          border: '1.5px solid #C1C2BB',
          borderRadius: '0.25rem',
          padding: '10px 12px',
          outline: 'none',
          marginBottom: 16,
          boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((item) => {
          const isOpen = expanded === item.prompt;
          return (
            <div
              key={item.prompt}
              style={{
                border: '1.5px solid #C1C2BB',
                borderRadius: '0.25rem',
                background: isOpen ? '#FBFCF9' : '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : item.prompt)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '14px 16px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  fontFamily: FONT_SANS,
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#2C2C2C',
                  lineHeight: 1.35,
                  flex: 1,
                }}>
                  {item.prompt}
                </span>
                <span style={{
                  fontFamily: FONT_MONO,
                  fontSize: 11,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: '#035C4B',
                  background: '#A9FF92',
                  padding: '4px 10px',
                  borderRadius: 999,
                  flexShrink: 0,
                }}>
                  {item.entries.length} {item.entries.length === 1 ? 'person' : 'people'}
                </span>
              </button>
              {isOpen && (
                <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {item.entries.map((entry) => (
                    <div
                      key={`${item.prompt}-${entry.name}-${entry.room}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 12px',
                        background: '#E7E8E3',
                        borderRadius: '0.25rem',
                      }}
                    >
                      <span style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: '#2C2C2C' }}>
                        {entry.name}
                      </span>
                      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#5C5C5C' }}>
                        Room {entry.room}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p style={{ fontFamily: FONT_SANS, color: '#5C5C5C', margin: '8px 0 0' }}>
          No prompts match your search.
        </p>
      )}
    </div>
  );
}

export function ResultsAnalytics({ onBack }: ResultsAnalyticsProps) {
  const { summary, loading, error } = usePublishedResults();

  return (
    <div style={{ ...pageStyle, padding: '48px 24px' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, gap: 16 }}>
          <img src={logotypeBlue} alt="Current" style={{ height: 18, width: 'auto' }} />
          <button type="button" onClick={onBack} style={monoButtonStyle('outline')}>
            ← Back
          </button>
        </div>

        <div style={{ marginBottom: 32 }}>
          <div style={{ ...monoLabelStyle, fontSize: 12, marginBottom: 8 }}>Game Results</div>
          <h1 style={{
            fontFamily: FONT_SANS,
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#2C2C2C',
            margin: 0,
          }}>
            Participant Frequency
          </h1>
        </div>

        {loading && (
          <p style={{ fontFamily: FONT_SANS, color: '#5C5C5C' }}>Loading results…</p>
        )}

        {error && (
          <p style={{ fontFamily: FONT_MONO, fontSize: 13, color: '#d4183d' }}>{error}</p>
        )}

        {!loading && !error && summary && summary.roomCount === 0 && (
          <p style={{ fontFamily: FONT_SANS, color: '#5C5C5C' }}>
            No game results are published yet.
          </p>
        )}

        {!loading && !error && summary && summary.roomCount > 0 && (
          <>
            <div style={{
              background: '#FBFCF9',
              border: '1.5px solid #C1C2BB',
              borderRadius: '0.25rem',
              padding: 24,
              marginBottom: 24,
            }}>
              <div style={{ ...monoLabelStyle, marginBottom: 16 }}>Names by prompt</div>
              <PromptBreakdown prompts={summary.prompts} />
            </div>

            <div style={{
              background: '#FBFCF9',
              border: '1.5px solid #C1C2BB',
              borderRadius: '0.25rem',
              padding: 24,
            }}>
              <div style={{ ...monoLabelStyle, marginBottom: 16 }}>Most named participants</div>
              {summary.participants.length > 0 ? (
                <ParticipantBarChart participants={summary.participants} />
              ) : (
                <p style={{ fontFamily: FONT_SANS, color: '#5C5C5C', margin: 0 }}>
                  No names found.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
