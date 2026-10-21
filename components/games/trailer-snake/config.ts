export const WORLD_W = 2000;
export const WORLD_H = 1400;
export const VIEW_W = 800;
export const VIEW_H = 500;

/** Match parking rigid container truck (top-down). */
export const CAB = { length: 100, width: 34 };
/** Same cargo box as the rigid truck (70% of 100). */
export const TRAILER = { length: 70, width: 34 };
/** Drawbar length between box rear and next box front. */
export const HITCH_GAP = 14;

export const CRUISE_SPEED = 1.15;
export const MAX_SPEED = 2.45;
export const MIN_SPEED = 0.4;
export const ACCEL = 0.032;
export const BRAKE = 0.055;
/** Front-wheel steer lock (radians), bicycle model. */
export const MAX_STEERING = 0.52;
/** Max articulation at each hitch — enough to track a curve, not a stiff pole. */
export const MAX_HITCH = 1.05;

export const ATTACH_MS = 560;
export const SPAWN_MS = 520;
export const PICKUP_MARGIN = 160;
export const PICKUP_MIN_DIST = 320;

export const STORAGE_KEY = "mtruck-ui-lab-trailer-snake-highscores";
export const MAX_HIGHSCORES = 4;
