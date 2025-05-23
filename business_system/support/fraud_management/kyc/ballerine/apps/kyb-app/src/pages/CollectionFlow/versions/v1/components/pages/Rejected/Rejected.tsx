import { useTranslation } from 'react-i18next';

import { useCustomer } from '@/components/providers/CustomerProvider';
import { Card } from '@ballerine/ui';

export const Rejected = () => {
  const { t } = useTranslation();
  const { customer } = useCustomer();

  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-[646px] p-12">
        <div className="mb-9 flex flex-col items-center gap-9">
          <img src={customer?.logoImageUri} className="max-h-[25%] max-w-[25%]" />
          <img src="/failed-circle.svg" className="h-[100px] w-[100px]" />
        </div>
        <div className="mb-10">
          <h1 className="mb-6 text-center text-3xl font-bold leading-8">{t('rejected.header')}</h1>
          <p className="text-muted-foreground text-center text-sm leading-5 opacity-50">
            {t('rejected.content')}
            <br />
            {customer && t('contact', { companyName: customer.displayName })}
          </p>
        </div>
      </Card>
    </div>
  );
};
