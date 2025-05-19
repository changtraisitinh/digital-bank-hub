import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

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

export const useCreateTransaction = createMutation<
  Response,
  Variables,
  AxiosError
>({
  mutationFn: async (variables) =>
    client({
      url: 'transaction/api/v1/transactions/create',
      method: 'POST',
      data: variables,
    }).then((response) => response.data),
});
