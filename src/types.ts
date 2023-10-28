export type MoveDirection =
  | "up"
  | "down"
  | "left"
  | "right"
  | "up-right"
  | "up-left"
  | "down-right"
  | "down-left"
  | "none";

export type Keys = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type User = {
  id: string;
  coordinates: Coordinates;
  mouseCoordinates: Coordinates;
  color: string;
};

export type Entity = {
  id: string;
  coordinates: Coordinates;
  color: string;
};

export type Environment = {
  width: number;
  height: number;
};

export type ServerState = {
  me: User;
  users: User[];
  entities: Entity[];
  environment: Environment;
};

export type LocalState = {
  mouseCoordinates: Coordinates;
  keys: Keys;
};
