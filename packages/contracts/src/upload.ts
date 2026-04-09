import type { EntityId } from "./common";

export type UploadImageResponse = {
  asset: {
    id: EntityId;
    url: string;
    fileName?: string;
  };
};

