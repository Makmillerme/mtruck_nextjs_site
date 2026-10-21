export type VehicleId = "rigid" | "tractor_semi" | "b_double";

export type GamePhase = "menu" | "playing" | "parking" | "won";

export type SegmentRole = "cab" | "trailer" | "rigid";

export type SegmentDef = {
  length: number;
  width: number;
  role: SegmentRole;
};

export type VehicleDef = {
  id: VehicleId;
  label: string;
  hint: string;
  segments: SegmentDef[];
  /** Max hitch bend between consecutive segments (radians). */
  maxHitchAngle: number;
  maxSpeed: number;
  minSpeed: number;
  acceleration: number;
  friction: number;
  brakeForce: number;
  maxSteering: number;
};

export type SegmentState = {
  x: number;
  y: number;
  angle: number;
  length: number;
  width: number;
  role: SegmentRole;
};

export type Aabb = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
};

export type Decoration = {
  type: string;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type ParkingSpot = {
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
};

export type BiomeKind = "village" | "city" | "park" | "terminal" | "yard";

export type BiomeRect = {
  kind: BiomeKind;
  x: number;
  y: number;
  w: number;
  h: number;
};

export type RoadSegment = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  /** Draw direction arrows along segment. */
  arrows?: boolean;
};

export type PropKind =
  | "house"
  | "tree"
  | "bench"
  | "booth"
  | "barrier"
  | "fence"
  | "sign";

export type MapProp = {
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  /** Radians; used by barrier arm. */
  angle?: number;
};

export type PathPoint = { x: number; y: number };

export type MapDef = {
  width: number;
  height: number;
  /** Camera / canvas buffer size (CSS window stays Lab-sized). */
  viewWidth: number;
  viewHeight: number;
  start: { x: number; y: number; angle: number };
  /** Base spot for rigid; scaled at runtime for longer vehicles. */
  baseSpot: ParkingSpot;
  biomes: BiomeRect[];
  roads: RoadSegment[];
  /** Animated guide polyline to the parking spot. */
  path: PathPoint[];
  /** Barrier gate center (cab proximity lifts arm). */
  barrier: { x: number; y: number; w: number; h: number };
  obstacles: Aabb[];
  decorations: Decoration[];
  props: MapProp[];
  /** Visual-only parked trucks (also solid obstacles). */
  parkedTrucks: Aabb[];
};

export type InputKeys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
};

export type GameSnapshot = {
  phase: GamePhase;
  parkingTimer: number;
  parkingHoldSeconds: number;
  score: number | null;
  segments: SegmentState[];
  speed: number;
  vehicleId: VehicleId;
  spot: ParkingSpot;
  /** Lead cab world position for camera. */
  camX: number;
  camY: number;
};
