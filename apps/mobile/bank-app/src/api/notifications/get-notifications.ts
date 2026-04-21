import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { Env } from '@/lib/env'; // Added import for Env

import { client } from '../common';
import { type Notification } from '../notifications';

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
type Response = Notification;

// Added logAPI function
const logAPI = (type: 'request' | 'response' | 'error', data: any) => {
  const icons = {
    request: '🚀',
    response: '✅',
    error: '❌',
  };
  console.log(
    `${icons[type]} [API ${type.toUpperCase()}] getNotifications:`, // Changed log identifier
    data
  );
};

export const useGetNotifications = createMutation<
  Response,
  Variables,
  AxiosError
>({
  mutationFn: async (variables) => {
    // Updated mutationFn with logging and Env.API_URL
    const requestConfig = {
      url: Env.API_URL + 'notification/api/v1/notifications?limit=10&offset=0', // Used Env.API_URL
      method: 'GET',
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
