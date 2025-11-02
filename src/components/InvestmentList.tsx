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
      <div className='text-center py-10 px-4 rounded-xl shadow-lg border backdrop-blur-sm'>
        <p>No investments added yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Card View */}
      <div className='md:hidden space-y-4'>
        {investments.map((investment) => (
          <div key={investment.id} className='rounded-xl shadow-lg border p-4'>
            <div className='flex justify-between items-start mb-3'>
              <div>
                <h3 className='font-semibold'>{investment.name}</h3>
                {investment.symbol && (
                  <p className='text-sm text-gray-600'>{investment.symbol}</p>
                )}
              </div>
              <span className='px-2 py-1 rounded text-xs font-medium border'>
                {investment.type}
              </span>
            </div>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm'>Amount:</span>
                <span className='font-medium'>
                  {new Intl.NumberFormat("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  }).format(Number(investment.amount))}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm'>Date:</span>
                <span className='font-medium'>
                  {new Date(investment.purchaseDate).toLocaleDateString()}
                </span>
              </div>
              <div className='flex justify-end'>
                <button
                  onClick={() => onDelete(investment.id)}
                  className='text-red-600 hover:text-red-800 text-sm underline'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className='hidden md:block overflow-x-auto rounded-xl shadow-lg border backdrop-blur-sm'>
        <table className='min-w-full divide-y'>
          <thead>
            <tr>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'
              >
                Name
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'
              >
                Type
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'
              >
                Amount
              </th>
              <th
                scope='col'
                className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'
              >
                Purchase Date
              </th>
              <th scope='col' className='relative px-6 py-3'>
                <span className='sr-only'>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {investments.map((investment) => (
              <tr
                key={investment.id}
                className='transition-colors duration-150'
              >
                <td className='px-6 py-4 whitespace-nowrap'>
                  <div className='text-sm font-medium'>{investment.name}</div>
                  {investment.symbol && (
                    <div className='text-xs'>{investment.symbol}</div>
                  )}
                </td>
                <td className='px-6 py-4 whitespace-nowrap'>
                  <span className='px-2 inline-flex text-xs leading-5 font-semibold rounded-full border'>
                    {investment.type}
                  </span>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>
                  {new Intl.NumberFormat("en-LK", {
                    style: "currency",
                    currency: "LKR",
                  }).format(Number(investment.amount))}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-sm'>
                  {new Date(investment.purchaseDate).toLocaleDateString()}
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                  <button
                    onClick={() => onDelete(investment.id)}
                    className='underline'
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default InvestmentList;
