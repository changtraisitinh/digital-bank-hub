import { ArrowLeft } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { usePageResolverContext } from '@/components/organisms/DynamicUI/PageResolver/hooks/usePageResolverContext';
import { useStateManagerContext } from '@/components/organisms/DynamicUI/StateManager/components/StateProvider';
import { useCustomer } from '@/components/providers/CustomerProvider';
import { useAppExit } from '@/hooks/useAppExit/useAppExit';
import { ctw } from '@ballerine/ui';
import { useGlobalUIState } from '@/pages/CollectionFlow/versions/v2/components/providers/GlobalUIState';

export const Navigation = () => {
  const { state: uiState } = useGlobalUIState();
  const { t } = useTranslation();
  const { stateApi, payload } = useStateManagerContext();
  const { currentPage } = usePageResolverContext();
  const { customer } = useCustomer();
  const { exit, isExitAvailable } = useAppExit();

  const currentPageNumber =
    Number(
      payload?.collectionFlow?.state?.steps?.findIndex(
        step => step.stepName === currentPage?.stateName,
      ),
    ) + 1;

  const isFirstStep = currentPageNumber === 1;
  const isDisabled = uiState.isFinalSubmitted || uiState.isSyncing;

  const onPrevious = useCallback(async () => {
    if (!isFirstStep) {
      await stateApi.sendEvent('PREVIOUS');

      return;
    }

    exit();

    return;
  }, [stateApi, exit, isFirstStep]);

  if (isFirstStep && !isExitAvailable) {
    return null;
  }

  return (
    <button
      className={ctw(
        'flex cursor-pointer select-none flex-row flex-nowrap items-center disabled:opacity-50',
      )}
      aria-disabled={isDisabled}
      disabled={isDisabled}
      type={'button'}
      onClick={onPrevious}
    >
      <ArrowLeft size={24} className="flex-shrink-0" />
      <span className="flex flex-nowrap pl-2 align-middle text-sm font-bold">
        {isFirstStep && customer
          ? t('backToPortal', { companyName: customer.displayName })
          : t('back')}
      </span>
    </button>
  );
};
