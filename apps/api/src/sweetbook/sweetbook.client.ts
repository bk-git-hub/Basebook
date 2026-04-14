import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { SeasonBookShippingInfo } from '@basebook/contracts';
import {
  getSweetbookConfig,
  isConfiguredSweetbookApiKey,
} from './sweetbook.config';

type SweetbookRequestOptions = {
  path: string;
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  idempotencyKey?: string;
};

type SweetbookFormRequestOptions = {
  path: string;
  formData: FormData;
};

type SweetbookApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: string[];
};

export type SweetbookBookSpec = {
  bookSpecUid: string;
  pageMin: number;
  pageMax: number;
  pageIncrement: number;
};

export type SweetbookOrderEstimate = {
  totalAmount?: number;
  totalProductAmount?: number;
  totalShippingFee?: number;
  creditSufficient?: boolean;
};

export type SweetbookCreatedOrder = {
  orderUid?: string;
  orderStatus?: number;
  orderStatusDisplay?: string;
  totalAmount?: number;
};

export type SweetbookOrderDetail = {
  orderUid?: string;
  orderStatus?: number;
  orderStatusDisplay?: string;
  totalAmount?: number;
  refundAmount?: number;
  cancelReason?: string;
  cancelledAt?: string;
  orderedAt?: string;
};

export type SweetbookReadiness = {
  configured: boolean;
  bookSpecsReachable: boolean;
  templatesReachable: boolean;
  creditsReachable: boolean;
};

@Injectable()
export class SweetbookClient {
  async checkReadiness(): Promise<SweetbookReadiness> {
    if (!this.isConfigured()) {
      return {
        configured: false,
        bookSpecsReachable: false,
        templatesReachable: false,
        creditsReachable: false,
      };
    }

    const [bookSpecsReachable, templatesReachable, creditsReachable] =
      await Promise.all([
        this.isReachable('/book-specs?limit=5'),
        this.isReachable('/templates?limit=5'),
        this.isReachable('/credits'),
      ]);

    return {
      configured: true,
      bookSpecsReachable,
      templatesReachable,
      creditsReachable,
    };
  }

  async getBookSpecs() {
    return this.request({ path: '/book-specs?limit=100' });
  }

  async getTemplates(bookSpecUid?: string) {
    const query = bookSpecUid
      ? `?limit=100&bookSpecUid=${encodeURIComponent(bookSpecUid)}`
      : '?limit=100';

    return this.request({ path: `/templates${query}` });
  }

  async getCredits() {
    return this.request({ path: '/credits' });
  }

  async createBook(input: {
    title: string;
    bookSpecUid: string;
    externalRef: string;
    idempotencyKey: string;
  }) {
    return this.request<{ bookUid: string }>({
      path: '/books',
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        title: input.title,
        bookSpecUid: input.bookSpecUid,
        externalRef: input.externalRef,
      },
    });
  }

  async createCover(
    bookUid: string,
    templateUid: string,
    parameters: Record<string, unknown>,
  ) {
    return this.requestTemplateForm({
      path: `/books/${bookUid}/cover`,
      templateUid,
      parameters,
    });
  }

  async insertContent(
    bookUid: string,
    templateUid: string,
    parameters: Record<string, unknown>,
    breakBefore: 'page' | 'column' | 'none' = 'page',
  ) {
    return this.requestTemplateForm<{ pageCount?: number }>({
      path: `/books/${bookUid}/contents?breakBefore=${breakBefore}`,
      templateUid,
      parameters,
    });
  }

  async finalizeBook(bookUid: string) {
    return this.request<{ pageCount?: number }>({
      path: `/books/${bookUid}/finalization`,
      method: 'POST',
      body: {},
    });
  }

  async estimateOrder(bookUid: string): Promise<SweetbookOrderEstimate> {
    return this.request<SweetbookOrderEstimate>({
      path: '/orders/estimate',
      method: 'POST',
      body: {
        items: [
          {
            bookUid,
            quantity: 1,
          },
        ],
      },
    });
  }

  async createOrder(input: {
    bookUid: string;
    recipientName: string;
    recipientPhone: string;
    postalCode: string;
    address1: string;
    address2?: string;
    externalRef: string;
    idempotencyKey: string;
  }): Promise<SweetbookCreatedOrder> {
    return this.request<SweetbookCreatedOrder>({
      path: '/orders',
      method: 'POST',
      idempotencyKey: input.idempotencyKey,
      body: {
        items: [
          {
            bookUid: input.bookUid,
            quantity: 1,
          },
        ],
        shipping: {
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          postalCode: input.postalCode,
          address1: input.address1,
          address2: input.address2,
        },
        externalRef: input.externalRef,
      },
    });
  }

  async getOrder(orderUid: string): Promise<SweetbookOrderDetail> {
    return this.request<SweetbookOrderDetail>({
      path: `/orders/${encodeURIComponent(orderUid)}`,
    });
  }

  async cancelOrder(
    orderUid: string,
    cancelReason: string,
  ): Promise<SweetbookOrderDetail> {
    return this.request<SweetbookOrderDetail>({
      path: `/orders/${encodeURIComponent(orderUid)}/cancel`,
      method: 'POST',
      body: {
        cancelReason,
      },
    });
  }

  async updateOrderShipping(
    orderUid: string,
    shipping: SeasonBookShippingInfo,
  ): Promise<SweetbookOrderDetail> {
    return this.request<SweetbookOrderDetail>({
      path: `/orders/${encodeURIComponent(orderUid)}/shipping`,
      method: 'PATCH',
      body: shipping,
    });
  }

  private async isReachable(path: string) {
    try {
      await this.request({ path });
      return true;
    } catch {
      return false;
    }
  }

  private async request<T = unknown>(
    options: SweetbookRequestOptions,
  ): Promise<T> {
    const config = getSweetbookConfig();

    if (!isConfiguredSweetbookApiKey(config.apiKey)) {
      throw new ServiceUnavailableException(
        'Sweetbook Sandbox API key is not configured.',
      );
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: 'application/json',
    };

    if (options.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    if (options.body) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${config.baseUrl}${options.path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const message = await this.readErrorMessage(response);
      throw new ServiceUnavailableException(
        `Sweetbook API request to ${options.path} failed with HTTP ${response.status}: ${message}`,
      );
    }

    return this.unwrapData<T>(
      (await response.json()) as SweetbookApiResponse<T>,
    );
  }

  private async requestTemplateForm<T = unknown>(options: {
    path: string;
    templateUid: string;
    parameters: Record<string, unknown>;
  }) {
    const formData = new FormData();
    formData.append('templateUid', options.templateUid);
    formData.append('parameters', JSON.stringify(options.parameters));

    return this.requestForm<T>({
      path: options.path,
      formData,
    });
  }

  private async requestForm<T = unknown>(
    options: SweetbookFormRequestOptions,
  ): Promise<T> {
    const config = getSweetbookConfig();

    if (!isConfiguredSweetbookApiKey(config.apiKey)) {
      throw new ServiceUnavailableException(
        'Sweetbook Sandbox API key is not configured.',
      );
    }

    const response = await fetch(`${config.baseUrl}${options.path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
      body: options.formData,
    });

    if (!response.ok) {
      const message = await this.readErrorMessage(response);
      throw new ServiceUnavailableException(
        `Sweetbook API form request to ${options.path} failed with HTTP ${response.status}: ${message}`,
      );
    }

    return this.unwrapData<T>(
      (await response.json()) as SweetbookApiResponse<T>,
    );
  }

  private unwrapData<T>(body: SweetbookApiResponse<T>) {
    if (body && typeof body === 'object' && 'data' in body) {
      return body.data as T;
    }

    return body as T;
  }

  private async readErrorMessage(response: Response) {
    try {
      const body = (await response.json()) as SweetbookApiResponse<unknown>;
      const errors = body.errors?.join(', ');
      return errors || body.message || 'No error message returned.';
    } catch {
      return 'No parseable error message returned.';
    }
  }

  isConfigured() {
    const config = getSweetbookConfig();
    return isConfiguredSweetbookApiKey(config.apiKey);
  }
}
