export interface RoomSummary {
  code: string;
  bingo_count: number;
  cells_completed: number;
  created_at: string;
}

export interface RoomState {
  code: string;
  card: string[];
  clicked_cells: boolean[];
  names: string[];
  bingo_count: number;
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
