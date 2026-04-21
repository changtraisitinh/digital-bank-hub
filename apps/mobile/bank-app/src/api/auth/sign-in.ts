import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { Env } from '@/lib/env'; // Added import for Env

import { client } from '../common';
import { type SignIn } from './types';

type Variables = {
  username: string;
};
type Response = SignIn;

// Added logAPI function
const logAPI = (type: 'request' | 'response' | 'error', data: any) => {
  const icons = {
    request: '🚀',
    response: '✅',
    error: '❌',
  };
  console.log(
    `${icons[type]} [API ${type.toUpperCase()}] SignIn:`, // Changed log identifier
    data
  );
};

export const useSignIn = createMutation<Response, Variables, AxiosError>({
  mutationFn: async (variables) => {
    // Updated mutationFn with logging and Env.API_URL
    const requestConfig = {
      url: Env.API_URL + 'authapi/v1/auth/login', // Used Env.API_URL
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
