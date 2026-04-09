import type { ActorRole, EntityId } from "./common";

export type SessionUser = {
  id: EntityId;
  displayName: string;
  email?: string;
  role: ActorRole;
};

export type AuthSessionResponse = {
  authenticated: boolean;
  user?: SessionUser;
};

