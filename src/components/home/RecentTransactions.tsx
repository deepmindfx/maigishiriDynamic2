import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import { formatCurrency, getStatusColor } from '../../lib/utils';

// Mock data for recent transactions
const mockTransactions = [
  {
    id: '1',
    type: 'airtime',
    amount: 1000,
    status: 'success',
    details: { network: 'MTN', phone: '08012345678' },
    createdAt: '2023-09-15T10:30:00Z',
  },
  {
    id: '2',
    type: 'data',
    amount: 2500,
    status: 'success',
    details: { network: 'Airtel', plan: '5GB', phone: '09087654321' },
    createdAt: '2023-09-14T16:45:00Z',
  },
  {
    id: '3',
    type: 'electricity',
    amount: 5000,
    status: 'pending',
    details: { disco: 'Ikeja Electric', meterNumber: '54321678901' },
    createdAt: '2023-09-14T09:15:00Z',
  },
];

const getTransactionLabel = (type: string, details: any) => {
  switch (type) {
    case 'airtime':
      return `${details.network} Airtime`;
    case 'data':
      return `${details.network} ${details.plan}`;
    case 'electricity':
      return `${details.disco}`;
    case 'waec':
      return 'WAEC Card';
    case 'wallet_funding':
      return `Wallet Funding`;
    case 'product_purchase':
      return 'Product Purchase';
    default:
      return 'Transaction';
  }
};

const getTransactionSubtitle = (type: string, details: any) => {
  switch (type) {
    case 'airtime':
      return `Top up`;
    case 'data':
      return `Data bundle`;
    case 'electricity':
      return `Bill payment`;
    case 'waec':
      return 'Education';
    case 'wallet_funding':
      return `To`;
    case 'product_purchase':
      return 'Buy Item';
    default:
      return '';
  }
};

const isDebit = (type: string) => {
  return ['airtime', 'data', 'electricity', 'waec', 'product_purchase'].includes(type);
};

const RecentTransactions: React.FC = () => {
  return (
    <div className="space-y-4">
      {mockTransactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
              {transaction.type === 'airtime' && (
                <span className="text-red-500 text-2xl">N</span>
              )}
              {transaction.type === 'data' && (
                <span className="text-blue-500 text-2xl">P</span>
              )}
              {transaction.type === 'electricity' && (
                <span className="text-yellow-500 text-2xl">P</span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {getTransactionLabel(transaction.type, transaction.details)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getTransactionSubtitle(transaction.type, transaction.details)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">
              {isDebit(transaction.type) ? '-' : '+'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;