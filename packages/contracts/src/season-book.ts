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
