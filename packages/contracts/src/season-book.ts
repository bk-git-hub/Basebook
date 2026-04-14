import type { CurrencyCode, EntityId, IsoDateTimeString } from "./common";

export type SeasonBookProjectStatus =
  | "DRAFT"
  | "ESTIMATED"
  | "ORDERED"
  | "FAILED";

export type SeasonBookOrderStatus =
  | "UNPLACED"
  | "PAID"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "SHIPPED"
  | "DELIVERED"
  | "UNKNOWN";

export type GetSeasonBookStatusParams = {
  projectId: EntityId;
};

export type SeasonBookProgressStepKey =
  | "PAID"
  | "PDF_READY"
  | "CONFIRMED"
  | "IN_PRODUCTION"
  | "PRODUCTION_COMPLETE"
  | "SHIPPED"
  | "DELIVERED";

export type SeasonBookProgressStepState = "completed" | "current" | "pending";

export type SeasonBookStatusSource = "LOCAL" | "SWEETBOOK";

export type SeasonBookProgressStep = {
  key: SeasonBookProgressStepKey;
  label: string;
  state: SeasonBookProgressStepState;
  occurredAt?: IsoDateTimeString;
};

export type SeasonBookEstimateRequest = {
  seasonYear: number;
  title: string;
  introText?: string;
  coverPhotoUrl: string;
  selectedEntryIds: EntityId[];
};

export type SeasonBookEstimateResponse = {
  projectId: EntityId;
  bookUid: string;
  pageCount: number;
  totalPrice: number;
  currency: CurrencyCode;
  projectStatus: SeasonBookProjectStatus;
  creditSufficient?: boolean;
};

export type SeasonBookOrderRequest = {
  projectId: EntityId;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  address1: string;
  address2?: string;
};

export type SeasonBookOrderResponse = {
  projectId: EntityId;
  orderUid: string;
  totalPrice: number;
  currency: CurrencyCode;
  projectStatus: SeasonBookProjectStatus;
  orderStatus: SeasonBookOrderStatus;
};

export type GetSeasonBookStatusResponse = {
  projectId: EntityId;
  bookUid?: string;
  orderUid?: string;
  projectStatus: SeasonBookProjectStatus;
  orderStatus: SeasonBookOrderStatus;
  source: SeasonBookStatusSource;
  sweetbookStatusCode?: number;
  sweetbookStatusDisplay?: string;
  progress: SeasonBookProgressStep[];
  updatedAt: IsoDateTimeString;
};

export type SeasonBookProjectSummary = {
  id: EntityId;
  ownerId: EntityId;
  seasonYear: number;
  title: string;
  bookUid?: string;
  orderUid?: string;
  pageCount?: number;
  totalPrice?: number;
  currency?: CurrencyCode;
  projectStatus: SeasonBookProjectStatus;
  orderStatus: SeasonBookOrderStatus;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
};
