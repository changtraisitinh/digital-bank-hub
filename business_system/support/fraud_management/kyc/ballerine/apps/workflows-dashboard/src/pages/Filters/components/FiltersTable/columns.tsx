import { JSONViewButton } from '@/components/molecules/JSONViewButton';
import { IFilter } from '@/domains/filters';
import { formatDate } from '@/utils/format-date';
import { createColumnHelper } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { valueOrNA } from '@/utils/value-or-na';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<IFilter>();

export const filtersTableColumns = [
  columnHelper.accessor('id', {
    cell: info => (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-gray-600">{info.getValue<string>()}</span>
        <button
          onClick={() => {
            navigator.clipboard
              .writeText(info.getValue<string>())
              .then(() => {
                toast.success('ID copied to clipboard');
              })
              .catch(() => {
                toast.error('Failed to copy ID to clipboard');
              });
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    ),
    header: () => <span className="font-semibold">ID</span>,
  }),
  columnHelper.accessor('name', {
    cell: info => <span className="font-medium text-blue-600">{info.getValue<string>()}</span>,
    header: () => <span className="font-semibold">Name</span>,
  }),
  columnHelper.accessor('entity', {
    cell: info => (
      <span className="rounded bg-violet-50 px-2 py-1 text-sm text-violet-700">
        {valueOrNA(info.getValue<string>())}
      </span>
    ),
    header: () => <span className="font-semibold">Entity</span>,
  }),
  columnHelper.accessor('query', {
    cell: info => (
      <div className="flex flex-row items-center gap-3">
        <JSONViewButton
          trigger={
            <Eye className="h-5 w-5 cursor-pointer text-gray-600 transition-colors hover:text-blue-600" />
          }
          json={JSON.stringify(info.getValue())}
        />
      </div>
    ),
    header: () => <span className="font-semibold">Definition</span>,
  }),
  columnHelper.accessor(
    row => {
      const query = row.query as { where?: { workflowDefinitionId?: { in?: string[] } } };
      return query.where?.workflowDefinitionId?.in?.[0] ?? '';
    },
    {
      id: 'workflowDefinitionId',
      cell: info => (
        <span className="font-mono text-sm text-gray-600">
          {valueOrNA(info.getValue<string>())}
        </span>
      ),
      header: () => <span className="font-semibold">Workflow ID</span>,
    },
  ),
  columnHelper.accessor('createdAt', {
    cell: info => <span className="text-gray-700">{formatDate(info.getValue<Date>())}</span>,
    header: () => <span className="font-semibold">Created At</span>,
  }),
];
