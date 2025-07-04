import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { formatCurrency, getStatusColor, getTransactionLabel, isDebit } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

type Transaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  details: any;
  created_at: string;
};

const RecentTransactions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate('/transactions');
  };

  return (
    <div className="my-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Last Transactions</h2>
        <button 
          onClick={handleViewAll}
          className="text-[#2C204D] text-sm font-medium"
        >
          View All
        </button>
      </div>
      
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2C204D]"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isDebit(transaction.type) ? 'bg-error-500 bg-opacity-10' : 'bg-success-500 bg-opacity-10'
                    }`}>
                      {isDebit(transaction.type) ? (
                        <ArrowUpRight className={isDebit(transaction.type) ? 'text-error-500' : 'text-success-500'} size={20} />
                      ) : (
                        <ArrowDownRight className="text-success-500" size={20} />
                      )}
                    </div>
                    
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getTransactionLabel(transaction.type, transaction.details)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      isDebit(transaction.type) ? 'text-error-500' : 'text-success-500'
                    }`}>
                      {isDebit(transaction.type) ? '-' : '+'}{formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={getStatusColor(transaction.status) as any} className="text-xs">
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default RecentTransactions;