"use client";

import { Investment } from "@/types";

interface InvestmentListProps {
  investments: Investment[];
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Investment>) => void;
}

export default function InvestmentList({
  investments,
  onDelete,
  onUpdate: _onUpdate,
}: InvestmentListProps) {
  const getTypeColor = (type: Investment["type"]) => {
    switch (type) {
      case "stock":
        return "bg-blue-100 text-blue-800";
      case "mutual-fund":
        return "bg-green-100 text-green-800";
      case "fd":
        return "bg-yellow-100 text-yellow-800";
      case "other":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type: Investment["type"]) => {
    switch (type) {
      case "stock":
        return "Stock";
      case "mutual-fund":
        return "Mutual Fund";
      case "fd":
        return "Fixed Deposit";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  if (investments.length === 0) {
    return (
      <div className='text-center py-12'>
        <svg
          className='mx-auto h-12 w-12 text-gray-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
        <h3 className='mt-2 text-sm font-medium text-gray-900'>
          No investments
        </h3>
        <p className='mt-1 text-sm text-gray-500'>
          Get started by adding a new investment.
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Name
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Type
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Symbol
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Amount
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Quantity
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Purchase Date
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200'>
          {investments.map((investment) => (
            <tr key={investment.id}>
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm font-medium text-gray-900'>
                  {investment.name}
                </div>
                {investment.notes && (
                  <div className='text-sm text-gray-500'>
                    {investment.notes}
                  </div>
                )}
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(
                    investment.type
                  )}`}
                >
                  {getTypeLabel(investment.type)}
                </span>
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {investment.symbol || "-"}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                Rs. {investment.amount.toLocaleString()}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {investment.quantity || "-"}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                {new Date(investment.purchaseDate).toLocaleDateString()}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                <button
                  onClick={() => onDelete(investment.id)}
                  className='text-red-600 hover:text-red-900'
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
