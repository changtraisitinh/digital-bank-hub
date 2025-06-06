import { Search as LucideSearch } from 'lucide-react';
import { FunctionComponent } from 'react';

export const Search: FunctionComponent<{
  value: string;
  placeholder?: string;
  onChange: (search: string) => void;
}> = ({ value, placeholder, onChange }) => {
  return (
    <div className="relative flex flex-col gap-1">
      <div className="input-group flex h-8 w-48 items-center rounded-[44px] border border-[#E5E7EB] shadow-[0_4px_4px_0_rgba(174,174,174,0.0625)]">
        <div className={`btn btn-square btn-ghost pointer-events-none -ms-2`}>
          <LucideSearch size={13} />
        </div>
        <input
          type={'search'}
          className="input input-xs -ml-3 h-[18px] w-full !border-0 pl-0 text-xs !outline-none !ring-0 placeholder:text-base-content"
          placeholder={placeholder ?? `Search`}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};
