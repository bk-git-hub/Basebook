import type {
  CurrencyCode,
  EntityId,
  IsoDateTimeString,
  SeasonBookOrderStatus,
  SeasonBookProjectStatus,
} from '@basebook/contracts';

export type SeasonBookOrderHistoryItem = {
  projectId: EntityId;
  seasonYear: number;
  title: string;
  bookUid?: string;
  orderUid: string;
  pageCount?: number;
  totalPrice: number;
  currency: CurrencyCode;
  projectStatus: SeasonBookProjectStatus;
  orderStatus: SeasonBookOrderStatus;
  createdAt: IsoDateTimeString;
  updatedAt: IsoDateTimeString;
};

export type GetSeasonBookOrdersResponse = {
  orders: SeasonBookOrderHistoryItem[];
};
