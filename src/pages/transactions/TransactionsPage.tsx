import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Filter, Search, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import TransactionDetailModal from '../../components/transactions/TransactionDetailModal';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  reference: string;
  details: any;
  created_at: string;
  updated_at: string;
}

const TransactionsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'success',
      success: 'success',
      failed: 'error',
      error: 'error',
      pending: 'warning'
    };
    return variants[status as keyof typeof variants] || 'default';
  };

  const getTransactionIcon = (type: string) => {
    const isCredit = ['wallet_funding', 'referral_bonus', 'refund'].includes(type);
    return isCredit ? (
      <ArrowDownLeft className="w-5 h-5 text-green-500" />
    ) : (
      <ArrowUpRight className="w-5 h-5 text-red-500" />
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const isCredit = ['wallet_funding', 'referral_bonus', 'refund'].includes(type);
    const sign = isCredit ? '+' : '-';
    return `${sign}₦${amount.toLocaleString()}`;
  };

  const formatTransactionType = (type: string) => {
    const typeMap = {
      wallet_funding: 'Wallet Funding',
      data_purchase: 'Data Purchase',
      airtime_purchase: 'Airtime Purchase',
      electricity_payment: 'Electricity Payment',
      waec_payment: 'WAEC Payment',
      product_purchase: 'Product Purchase',
      referral_bonus: 'Referral Bonus',
      refund: 'Refund'
    };
    return typeMap[type as keyof typeof typeMap] || type.replace('_', ' ').toUpperCase();
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatTransactionType(transaction.type).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h1>
          <p className="text-gray-600">View and manage your transaction history</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </Select>

              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="wallet_funding">Wallet Funding</option>
                <option value="data_purchase">Data Purchase</option>
                <option value="airtime_purchase">Airtime Purchase</option>
                <option value="electricity_payment">Electricity</option>
                <option value="product_purchase">Product Purchase</option>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <div className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Your transactions will appear here once you start using our services.'}
                </p>
              </div>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card 
                key={transaction.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTransactionClick(transaction)}
              >
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type)}
                        {getStatusIcon(transaction.status)}
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {formatTransactionType(transaction.type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {transaction.reference}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        ['wallet_funding', 'referral_bonus', 'refund'].includes(transaction.type)
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {formatAmount(transaction.amount, transaction.type)}
                      </div>
                      <Badge variant={getStatusBadge(transaction.status)}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline">
              Load More Transactions
            </Button>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
};

export default TransactionsPage;