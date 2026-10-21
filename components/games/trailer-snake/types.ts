export type GameState = "idle" | "playing" | "paused" | "gameOver";

export type InputKeys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
};

export type SegmentRole = "cab" | "trailer";

export type SegmentState = {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  role: SegmentRole;
  /** 0..1 hitch-in animation; 1 = locked. */
  attachT: number;
  originX?: number;
  originY?: number;
  originAngle?: number;
};

export type Pickup = {
  x: number;
  y: number;
  angle: number;
  /** 0..1 spawn scale-in. */
  spawnT: number;
};

export type HighscoreEntry = {
  score: number;
  date: string;
};

export type GameSnapshot = {
  state: GameState;
  segments: SegmentState[];
  pickup: Pickup | null;
  speed: number;
  score: number;
  highscores: HighscoreEntry[];
};
