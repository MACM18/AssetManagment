"use client";

import { Investment } from "@/types";

interface InvestmentListProps {
  investments: Investment[];
  onDelete: (id: string) => void;
}

const InvestmentList: React.FC<InvestmentListProps> = ({
  investments,
  onDelete,
}) => {
  if (investments.length === 0) {
    return (
      <div className='text-center py-10 px-4 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm'>
        <p className='text-gray-500 dark:text-gray-400'>
          No investments added yet. Add one to get started!
        </p>
      </div>
    );
  }

  return (
    <div className='overflow-x-auto bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50 backdrop-blur-sm'>
      <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
        <thead className='bg-gray-50 dark:bg-gray-700/50'>
          <tr>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
            >
              Name
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
            >
              Type
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
            >
              Amount
            </th>
            <th
              scope='col'
              className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'
            >
              Purchase Date
            </th>
            <th scope='col' className='relative px-6 py-3'>
              <span className='sr-only'>Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
          {investments.map((investment) => (
            <tr
              key={investment.id}
              className='hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150'
            >
              <td className='px-6 py-4 whitespace-nowrap'>
                <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {investment.name}
                </div>
                {investment.symbol && (
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {investment.symbol}
                  </div>
                )}
              </td>
              <td className='px-6 py-4 whitespace-nowrap'>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    investment.type === "stock"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                      : investment.type === "mutual-fund"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                      : investment.type === "fd"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                  }`}
                >
                  {investment.type}
                </span>
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100'>
                {new Intl.NumberFormat("en-LK", {
                  style: "currency",
                  currency: "LKR",
                }).format(Number(investment.amount))}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                {new Date(investment.purchaseDate).toLocaleDateString()}
              </td>
              <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                <button
                  onClick={() => onDelete(investment.id)}
                  className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300'
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
};

export default InvestmentList;
