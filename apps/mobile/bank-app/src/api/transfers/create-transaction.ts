import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { Env } from '@/lib/env'; // Added import for Env

import { client } from '../common';
import { type Transaction } from './types';

type Variables = {
  description: string;
  send: {
    scale: number;
    value: number;
    asset: string;
    source: {
      from: [
        {
          amount: {
            scale: number;
            value: number;
            asset: string;
          };
          account: string;
        },
      ];
    };
    distribute: {
      to: [
        {
          amount: {
            scale: number;
            value: number;
            asset: string;
          };
          account: string;
        },
      ];
    };
  };
};
type Response = Transaction;

// Added logAPI function
const logAPI = (type: 'request' | 'response' | 'error', data: any) => {
  const icons = {
    request: '🚀',
    response: '✅',
    error: '❌',
  };
  console.log(
    `${icons[type]} [API ${type.toUpperCase()}] createTransaction:`, // Changed log identifier
    data
  );
};

export const useCreateTransaction = createMutation<
  Response,
  Variables,
  AxiosError
>({
  mutationFn: async (variables) => {
    // Updated mutationFn with logging and Env.API_URL
    const requestConfig = {
      url: Env.API_URL + 'transaction/api/v1/transactions/create', // Used Env.API_URL
      method: 'POST',
      data: variables,
    };

    logAPI('request', requestConfig);

    try {
      const response = await client(requestConfig);
      logAPI('response', response.data);
      return response.data;
    } catch (error) {
      logAPI('error', error);
      throw error;
    }
  },
});
