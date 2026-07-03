import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const FREE_SPACE_INDEX = 12;
const BOARD_SIZE = 25;
const ROOM_TTL_MS = 60 * 60 * 1000; // 1 hour

interface StoredRoom {
  code: string;
  card: string[];
  clicked_cells: boolean[];
  names: string[];
  bingo_count: number;
  created_at: string;
  updated_at?: string;
}

interface RoomScoreboardEntry {
  code: string;
  bingo_count: number;
  cells_completed: number;
  created_at: string;
}

const SQUARES = [
  "Has more than 3 siblings",
  "Lives in a different state than they were born",
  "Has 3 or more pets",
  "Has a musical instrument in the room with them right now",
  "Has never seen Star Wars",
  "Speaks more than 2 languages",
  "Has been to more than 10 countries",
  "Worked a food service job",
  "Been to a concert in the last 3 months",
  "Has been on television",
  "Has lived in another country",
  "Has a twin",
  "Coached or refereed a youth sport",
  "Has a garden",
  "Has pulled an all-nighter in the last year",
  "Has eaten something bizarre on a dare",
  "Has a famous person follow them on social media",
  "Has cried at a commercial",
  "Has been on a blind date",
  "Owns a piece of furniture they built themselves",
  "Has changed a tire on the side of the road for someone they didn't know",
  "Has strong feelings about how a dishwasher should be loaded",
  "Has lied about having read a book",
  "Owns a gaming console from before 2000",
];

function shuffleCard(): string[] {
  const shuffled = [...SQUARES].sort(() => Math.random() - 0.5);
  shuffled.splice(FREE_SPACE_INDEX, 0, "FREE");
  return shuffled;
}

function createInitialClicked(): boolean[] {
  const clicked = new Array(BOARD_SIZE).fill(false);
  clicked[FREE_SPACE_INDEX] = true;
  return clicked;
}

function roomKey(code: string) {
  return `room:${code.toUpperCase()}`;
}

function isExpired(room: StoredRoom): boolean {
  if (!room.created_at) return false;
  return Date.now() - new Date(room.created_at).getTime() > ROOM_TTL_MS;
}

const app = new Hono();

app.use('*', logger(console.log));
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

app.get("/make-server-dff036a6/health", (c) => {
  return c.json({ status: "ok" });
});

// Join or create a room
app.post("/make-server-dff036a6/rooms/join", async (c) => {
  const { code } = await c.req.json();
  if (!code || code.trim() === "") {
    return c.json({ error: "Room code required" }, 400);
  }
  const key = roomKey(code.trim());
  let room = await kv.get(key) as StoredRoom | null;
  if (room && isExpired(room)) room = null; // treat expired rooms as non-existent
  if (!room) {
    room = {
      code: code.trim().toUpperCase(),
      card: shuffleCard(),
      clicked_cells: createInitialClicked(),
      names: new Array(BOARD_SIZE).fill(""),
      bingo_count: 0,
      created_at: new Date().toISOString(),
    };
    await kv.set(key, room);
    const index: string[] = (await kv.get("rooms:index")) ?? [];
    if (!index.includes(room.code)) {
      index.push(room.code);
      await kv.set("rooms:index", index);
    }
  }
  return c.json(room);
});

// Update room state
app.put("/make-server-dff036a6/rooms/:code", async (c) => {
  const code = c.req.param("code").toUpperCase();
  const key = roomKey(code);
  const room = await kv.get(key) as StoredRoom | null;
  if (!room) return c.json({ error: "Room not found" }, 404);
  const body = await c.req.json() as Partial<Pick<StoredRoom, "clicked_cells" | "names" | "bingo_count">>;
  const updated = {
    ...room,
    clicked_cells: body.clicked_cells ?? room.clicked_cells,
    names: body.names ?? room.names,
    bingo_count: body.bingo_count ?? room.bingo_count,
    updated_at: new Date().toISOString(),
  };
  await kv.set(key, updated);
  return c.json(updated);
});

// Get all rooms for scoreboard (excludes expired rooms)
app.get("/make-server-dff036a6/rooms", async (c) => {
  const index: string[] = (await kv.get("rooms:index")) ?? [];
  const rooms = await Promise.all(
    index.map(async (code) => {
      const room = await kv.get(roomKey(code)) as StoredRoom | null;
      if (!room || isExpired(room)) return null;
      const clicked: boolean[] = room.clicked_cells ?? [];
      const cells_completed = clicked.filter(Boolean).length - 1; // subtract free space
      return { code: room.code, bingo_count: room.bingo_count, cells_completed, created_at: room.created_at };
    })
  );
  return c.json(
    rooms
      .filter((room): room is RoomScoreboardEntry => room !== null)
      .sort((a, b) => (b.bingo_count ?? 0) - (a.bingo_count ?? 0))
  );
});

Deno.serve(app.fetch);
