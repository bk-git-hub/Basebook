import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import {
  getSweetbookConfig,
  isConfiguredSweetbookApiKey,
} from './sweetbook.config';

type SweetbookRequestOptions = {
  path: string;
  method?: 'GET' | 'POST';
  body?: unknown;
  idempotencyKey?: string;
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

  private async isReachable(path: string) {
    try {
      await this.request({ path });
      return true;
    } catch {
      return false;
    }
  }

  private async request(options: SweetbookRequestOptions) {
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
      throw new ServiceUnavailableException(
        `Sweetbook API request failed with HTTP ${response.status}.`,
      );
    }

    return response.json();
  }

  private isConfigured() {
    const config = getSweetbookConfig();
    return isConfiguredSweetbookApiKey(config.apiKey);
  }
}
