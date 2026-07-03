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
