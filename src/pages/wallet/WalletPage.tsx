import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, History, RefreshCw, ArrowRightLeft, CreditCard, DollarSign, PlusCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatDate, formatDateTime, getStatusColor } from '../../lib/utils';

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

const getTransactionLabel = (type: string, details: any) => {
  switch (type) {
    case 'airtime':
      return `${details.network} Airtime - ${details.phone}`;
    case 'data':
      return `${details.network} ${details.plan} - ${details.phone}`;
    case 'electricity':
      return `${details.disco} - ${details.meterNumber}`;
    case 'waec':
      return 'WAEC Card';
    case 'wallet_funding':
      // Check if this is a bank transfer with originator info
      if (details.flutterwave_data?.meta_data?.originatorname) {
        return `Wallet Funding from ${details.flutterwave_data.meta_data.originatorname} (${details.payment_method || 'bank_transfer'})`;
      }
      return `Wallet Funding (${details.method || details.payment_method || 'wallet'})`;
    case 'product_purchase':
      return `Product Purchase - ${details.product_name || 'Product'}`;
    default:
      return 'Transaction';
  }
};

const isDebit = (type: string) => {
  return ['airtime', 'data', 'electricity', 'waec', 'product_purchase'].includes(type);
};

const WalletPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUserData } = useAuthStore();
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecentTransactions();
    }
  }, [isAuthenticated, user]);

  const fetchRecentTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      await refreshUserData();
      await fetchRecentTransactions();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="py-6 animate-fade-in">
        <Card className="text-center p-8">
          <h2 className="text-xl font-semibold mb-4">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please login to access your wallet.
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-6 animate-fade-in">
      {/* Wallet Balance Card */}
      <div className="relative mb-6 rounded-3xl overflow-hidden bg-wallet-bg text-white">
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-wallet-accent opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-wallet-accent opacity-20"></div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-sm opacity-80">Balance</h2>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(user?.walletBalance || 0)}
              </p>
            </div>
            
            <div>
              <h2 className="text-sm opacity-80">Card</h2>
              <p className="text-xl font-bold mt-1">Mabank</p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              icon={<RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />}
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-transparent border-white/20 text-white hover:bg-white/10"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col items-center">
          <button 
            onClick={() => navigate('/wallet/fund')}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 border border-gray-100"
          >
            <ArrowRightLeft size={24} className="text-indigo-600" />
          </button>
          <span className="text-xs text-indigo-600 font-medium">Transfer</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={() => navigate('/services')}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 border border-gray-100"
          >
            <CreditCard size={24} className="text-indigo-600" />
          </button>
          <span className="text-xs text-indigo-600 font-medium">Payment</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={() => navigate('/services')}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 border border-gray-100"
          >
            <DollarSign size={24} className="text-indigo-600" />
          </button>
          <span className="text-xs text-indigo-600 font-medium">Payout</span>
        </div>
        
        <div className="flex flex-col items-center">
          <button 
            onClick={() => navigate('/wallet/fund')}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 border border-gray-100"
          >
            <PlusCircle size={24} className="text-indigo-600" />
          </button>
          <span className="text-xs text-indigo-600 font-medium">Top up</span>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Recent Transactions</h2>
        <a href="/transactions" className="text-primary-500 text-sm">
          View All
        </a>
      </div>
      
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F9D58]"></div>
          </div>
        ) : recentTransactions.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentTransactions.map((transaction) => (
              <li key={transaction.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isDebit(transaction.type)
                        ? 'bg-error-500 bg-opacity-10'
                        : 'bg-success-500 bg-opacity-10'
                    }`}
                  >
                    {isDebit(transaction.type) ? (
                      <ArrowUpRight
                        className={isDebit(transaction.type) ? 'text-error-500' : 'text-success-500'}
                        size={20}
                      />
                    ) : (
                      <ArrowDownRight className="text-success-500" size={20} />
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium">
                      {getTransactionLabel(transaction.type, transaction.details)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDateTime(transaction.created_at)}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        isDebit(transaction.type) ? 'text-error-500' : 'text-success-500'
                      }`}
                    >
                      {isDebit(transaction.type) ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge variant={getStatusColor(transaction.status) as any}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No transactions yet. Start using our services to see your transaction history here.
          </div>
        )}
      </Card>
    </div>
  );
};

export default WalletPage;