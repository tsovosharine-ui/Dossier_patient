import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

export interface IntegrationConfig {
  apiUrl: string;
  endpoint: string;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface IntegrationResult {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: any;
  error?: string;
}

@Injectable()
export class ExternalIntegrationService {
  private readonly logger = new Logger(ExternalIntegrationService.name);
  private readonly defaultTimeout = 30000; // 30 seconds

  constructor(private readonly httpService: HttpService) {}

  /**
   * Generic method to send data to an external API
   */
  async sendToExternalApi<T = any>(
    config: IntegrationConfig,
    payload: any,
  ): Promise<IntegrationResult> {
    const {
      apiUrl,
      endpoint,
      headers = {},
      timeout = this.defaultTimeout,
    } = config;
    const url = `${apiUrl}${endpoint}`;

    try {
      this.logger.log(`Sending request to ${url}...`);

      const response = await firstValueFrom(
        this.httpService
          .post<T>(url, payload, {
            headers: {
              'Content-Type': 'application/json',
              ...headers,
            },
            timeout,
          })
          .pipe(
            catchError((error) => {
              const errorMessage = this.extractErrorMessage(error);
              this.logger.error(
                `Error calling external API ${url}: ${errorMessage}`,
              );
              throw new Error(errorMessage);
            }),
          ),
      );

      const { data, status } = response;

      this.logger.log(`Successfully sent request to ${url}. Status: ${status}`);

      return {
        success: true,
        statusCode: status,
        data,
        message: 'Request sent successfully',
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send request to ${url}: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
        message: 'Failed to send request',
      };
    }
  }

  /**
   * Extract error message from Axios error
   */
  private extractErrorMessage(error: any): string {
    if (error.response) {
      return `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    }
    if (error.request) {
      return 'No response received from server';
    }
    return error.message || 'Unknown error';
  }

  /**
   * Check if the result is successful (status 200 or 201)
   */
  isSuccess(result: IntegrationResult): boolean {
    return (
      result.success && (result.statusCode === 200 || result.statusCode === 201)
    );
  }
}
