import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { Env } from '@/lib/env';

import { client } from '../common';
import { type Account } from './types';

type Variables = { accountId: string };
type Response = Account;

const logAPI = (type: 'request' | 'response' | 'error', data: any) => {
  const icons = {
    request: '🚀',
    response: '✅',
    error: '❌',
  };
  console.log(
    `${icons[type]} [API ${type.toUpperCase()}] getAccountList:`,
    data
  );
};

export const useGetAccountList = createMutation<
  Response,
  Variables,
  AxiosError
>({
  mutationFn: async (variables) => {
    const requestConfig = {
      url: Env.API_URL + 'api/v1/accounts/list',
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
