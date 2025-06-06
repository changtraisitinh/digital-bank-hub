import { CaretSortIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import { CheckIcon } from 'lucide-react';
import React, {
  FocusEvent,
  FocusEventHandler,
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';

import { ctw } from '@/common';
import {
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
} from '@/components/atoms';
import { DropdownInputProps, DropdownOption } from './types';

const dropdownItemVariants: Record<
  string,
  (option: DropdownOption, value?: string) => React.ReactNode
> = {
  default: (option, value) => (
    <>
      {option.label}
      <CheckIcon
        className={clsx('ml-auto h-4 w-4', option.value === value ? 'opacity-100' : 'opacity-0')}
      />
    </>
  ),
  inverted: (option, value) => {
    const isChosenValue = option.value === value;

    return (
      <>
        <CheckIcon className={clsx('mr-2 h-4 w-4', isChosenValue ? 'opacity-100' : 'opacity-0')} />
        <span className={clsx(isChosenValue && 'font-medium')}>{option.label}</span>
      </>
    );
  },
};

export const DropdownInput: FunctionComponent<DropdownInputProps> = ({
  name,
  options,
  value,
  placeholdersParams = {},
  notFoundText,
  searchable = false,
  disabled,
  testId,
  onChange,
  onBlur,
  onFocus,
  props,
  textInputClassName,
}) => {
  const { placeholder = '', searchPlaceholder = '' } = placeholdersParams;
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find(option => option.value !== undefined && option.value === value),
    [options, value],
  );

  const handleOpenChange = useCallback(
    (state: boolean) => {
      setOpen(state);

      const hasBeenClosed = !state;

      if (!hasBeenClosed || !onBlur) {
        return;
      }

      onBlur({
        target: {
          name: name,
          value: value,
        } as unknown,
      } as FocusEvent<HTMLInputElement>);
    },
    [name, value, onBlur],
  );

  const dropdownItem =
    dropdownItemVariants[props?.item?.variant as keyof typeof dropdownItemVariants] ??
    dropdownItemVariants.default;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={clsx(
            'flex w-full flex-nowrap bg-white px-2',
            !selectedOption && 'text-muted-foreground',
            props?.trigger?.className,
          )}
          disabled={disabled}
          tabIndex={0}
          onFocus={onFocus as FocusEventHandler<HTMLButtonElement>}
          onBlur={onBlur as FocusEventHandler<HTMLButtonElement>}
          data-testid={testId ? `${testId}-trigger` : undefined}
        >
          <span className="flex-1 truncate text-left">
            {selectedOption && selectedOption.value !== undefined
              ? selectedOption.label
              : placeholder}
          </span>
          {props?.trigger?.icon ?? <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        disablePortal
        align={props?.content?.align || 'center'}
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        className={clsx('p-2', props?.content?.className)}
      >
        <Command className="w-full">
          {searchable ? (
            <CommandInput
              onBlur={onBlur}
              onFocus={onFocus}
              placeholder={searchPlaceholder}
              className={ctw('placeholder:text-muted-foreground h-9', textInputClassName)}
            />
          ) : null}
          <CommandEmpty>{notFoundText || ''}</CommandEmpty>
          <ScrollArea orientation="both" className={clsx({ 'h-[200px]': options.length > 6 })}>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  value={option.label}
                  key={option.value}
                  data-testid={testId ? `${testId}-option` : undefined}
                  onSelect={(label: string) => {
                    const option = options.find(
                      option => option.label.toLocaleLowerCase() === label.toLocaleLowerCase(),
                    );

                    onChange(option?.value || undefined!, name);
                    setOpen(false);
                  }}
                >
                  {dropdownItem?.(option, value)}
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
