const BOARD_SIZE = 25;
const FREE_SPACE_INDEX = 12;

export interface StoredRoom {
  code: string;
  card: string[];
  names: string[];
  clicked_cells?: boolean[];
  bingo_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ParticipantStat {
  name: string;
  count: number;
  rooms: string[];
}

export interface PromptNameEntry {
  name: string;
  room: string;
}

export interface PromptStat {
  prompt: string;
  entries: PromptNameEntry[];
  uniqueNames: string[];
}

export interface AnalyticsSummary {
  roomCount: number;
  totalEntries: number;
  uniqueParticipants: number;
  participants: ParticipantStat[];
  prompts: PromptStat[];
  dateRange: { earliest: string | null; latest: string | null };
  publishedAt?: string | null;
}

function isStoredRoom(value: unknown): value is StoredRoom {
  if (!value || typeof value !== "object") return false;
  const room = value as StoredRoom;
  return typeof room.code === "string"
    && Array.isArray(room.names)
    && Array.isArray(room.card);
}

function isValidName(rawName: string): boolean {
  const trimmed = rawName.trim();
  return trimmed.length > 0 && trimmed.toUpperCase() !== "NAME";
}

function shouldIncludeCell(room: StoredRoom, index: number): boolean {
  if (index === FREE_SPACE_INDEX) return false;
  if (room.card[index] === "FREE") return false;
  if (room.clicked_cells && !room.clicked_cells[index]) return false;
  return isValidName(room.names[index] ?? "");
}

export function buildAnalyticsSummary(
  rooms: StoredRoom[],
  publishedAt: string | null = null,
): AnalyticsSummary {
  const counts = new Map<string, { displayName: string; count: number; rooms: Set<string> }>();
  const byPrompt = new Map<string, PromptNameEntry[]>();
  const timestamps: number[] = [];

  for (const room of rooms) {
    if (room.created_at) {
      const ts = new Date(room.created_at).getTime();
      if (!Number.isNaN(ts)) timestamps.push(ts);
    }
    for (let index = 0; index < BOARD_SIZE; index += 1) {
      if (!shouldIncludeCell(room, index)) continue;
      const trimmed = room.names[index].trim();
      const nameKey = trimmed.toLowerCase();
      const existing = counts.get(nameKey);
      if (existing) {
        existing.count += 1;
        existing.rooms.add(room.code);
      } else {
        counts.set(nameKey, { displayName: trimmed, count: 1, rooms: new Set([room.code]) });
      }
      const prompt = room.card[index]?.trim();
      if (!prompt || prompt === "FREE") continue;
      const entries = byPrompt.get(prompt) ?? [];
      entries.push({ name: trimmed, room: room.code });
      byPrompt.set(prompt, entries);
    }
  }

  const participants = [...counts.values()]
    .map(({ displayName, count, rooms: roomSet }) => ({
      name: displayName,
      count,
      rooms: [...roomSet].sort(),
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const prompts = [...byPrompt.entries()]
    .map(([prompt, entries]) => ({
      prompt,
      entries: entries.sort((a, b) => a.name.localeCompare(b.name) || a.room.localeCompare(b.room)),
      uniqueNames: [...new Set(entries.map((entry) => entry.name))].sort(),
    }))
    .sort((a, b) => b.entries.length - a.entries.length || a.prompt.localeCompare(b.prompt));

  const sortedTimes = timestamps.sort((a, b) => a - b);

  return {
    roomCount: rooms.length,
    totalEntries: participants.reduce((sum, participant) => sum + participant.count, 0),
    uniqueParticipants: participants.length,
    participants,
    prompts,
    dateRange: {
      earliest: sortedTimes.length ? new Date(sortedTimes[0]).toISOString() : null,
      latest: sortedTimes.length ? new Date(sortedTimes[sortedTimes.length - 1]).toISOString() : null,
    },
    publishedAt,
  };
}

export function emptyAnalyticsSummary(): AnalyticsSummary {
  return buildAnalyticsSummary([], null);
}

export { isStoredRoom };
