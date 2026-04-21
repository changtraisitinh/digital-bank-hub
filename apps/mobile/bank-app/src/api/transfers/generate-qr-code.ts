import type { AxiosError } from 'axios';
import { createQuery } from 'react-query-kit';

import { Env } from '@/lib/env';

import { client } from '../common';

// Define the new Variables type for the QR code generation
type Variables = {
  bankCode: string;
  accountNumber: string;
  accountName: string;
  amount: number;
};

// Update Response type to handle binary data (JPEG image)
type QRCodeResponse = ArrayBuffer;

// Helper function for logging
const logAPI = (type: 'request' | 'response' | 'error', data: any) => {
  console.log(`[API ${type.toUpperCase()}] generateQRCode:`, {
    method: data.method,
    params: data.params,
    url: data.url,
  });
};

export const useGenerateQRCode = createQuery<
  QRCodeResponse,
  Variables,
  AxiosError
>({
  queryKey: ['generateQrCode'],
  fetcher: async (variables) => {
    const baseUrl = Env.API_URL + 'banking-integration/api/v1/qrcode/generate';
    const requestConfig = {
      url: baseUrl,
      method: 'GET',
      params: variables || {
        bankCode: '970415',
        accountNumber: '113366668888',
        accountName: 'QUY UNG HO NGAN HANG',
        amount: '99000',
      },
      responseType: 'arraybuffer', // Important: Set response type to handle binary data
      headers: {
        Accept: 'image/jpeg', // Specify that we expect JPEG image response
      },
    };

    logAPI('request', requestConfig);

    try {
      const response = await client<QRCodeResponse>(requestConfig);
      logAPI('response', {
        status: response.status,
        headers: response.headers,
        method: 'GET',
        url: baseUrl || '',
        dataType: 'Binary Image Data (JPEG)',
      });
      return response.data;
    } catch (error) {
      logAPI('error', error);
      throw error;
    }
  },
});
