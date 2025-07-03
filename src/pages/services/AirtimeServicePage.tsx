import React, { useState, useEffect } from 'react';
import { ArrowLeft, Phone, CheckCircle, XCircle, User, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { serviceAPI } from '../../lib/serviceApi';
import { formatCurrency } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import TransactionPinModal from '../../components/ui/TransactionPinModal';
import SetPinModal from '../../components/ui/SetPinModal';

type Beneficiary = {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  network: string;
  type: 'airtime' | 'data';
  created_at: string;
};

const networkProviders = [
  { 
    value: 'MTN', 
    label: 'MTN',
    color: 'bg-yellow-500',
    imageUrl: 'https://i.ibb.co/350xQ0HH/mtn.png'
  },
  { 
    value: 'AIRTEL', 
    label: 'Airtel',
    color: 'bg-red-500',
    imageUrl: 'https://i.ibb.co/LzNyT4v4/airtel.png'
  },
  { 
    value: 'GLO', 
    label: 'Glo',
    color: 'bg-green-500',
    imageUrl: 'https://i.ibb.co/NnZLfCHC/glo.jpg'
  },
  { 
    value: '9MOBILE', 
    label: '9mobile',
    color: 'bg-teal-500',
    imageUrl: 'https://i.ibb.co/zW7WwvnL/9-mobile.webp'
  },
];

// Predefined airtime amounts
const predefinedAmounts = [
  { amount: 50 },
  { amount: 100 },
  { amount: 200 },
  { amount: 500 },
  { amount: 1000 },
  { amount: 2000 },
];

const AirtimeServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateWalletBalance } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('MTN');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAmountValue, setSelectedAmountValue] = useState<number | null>(null);
  const [saveAsBeneficiary, setSaveAsBeneficiary] = useState(false);
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [transaction, setTransaction] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBeneficiaries();
    }
  }, [user]);

  const fetchBeneficiaries = async () => {
    if (!user) return;
    
    setLoadingBeneficiaries(true);
    try {
      // Fetch beneficiaries from the database
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'airtime')
        .order('created_at', { ascending: false });
        
      if (error) {
        // If there's an error, we'll use transaction history to extract beneficiaries
        console.error('Error fetching beneficiaries:', error);
        
        // Get airtime transactions
        const { data: transactionData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', 'airtime')
          .eq('status', 'success')
          .order('created_at', { ascending: false });
          
        if (txError) throw txError;
        
        // Extract unique beneficiaries from transaction history
        const beneficiaryMap = new Map<string, Beneficiary>();
        
        transactionData?.forEach(transaction => {
          const phone = transaction.details?.phone;
          const network = transaction.details?.network;
          
          if (phone && network && !beneficiaryMap.has(phone)) {
            beneficiaryMap.set(phone, {
              id: transaction.id,
              user_id: user.id,
              name: `Beneficiary (${network})`,
              phone_number: phone,
              network: network.toUpperCase(), // Ensure network is uppercase to match networkProviders
              type: 'airtime',
              created_at: transaction.created_at
            });
          }
        });
        
        setBeneficiaries(Array.from(beneficiaryMap.values()));
      } else {
        setBeneficiaries(data || []);
      }
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const handleContinue = () => {
    if (!selectedNetwork || !phoneNumber || !amount) {
      return;
    }
    
    // Check if user has PIN set
    if (user && !user.hasPin) {
      setShowSetPinModal(true);
      return;
    }
    
    setStep(2);
  };

  const handlePayment = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check if user has PIN set
    if (user.hasPin) {
      setShowPinModal(true);
      return;
    }

    // If no PIN is set, proceed with payment
    await processPayment();
  };

  const processPayment = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const numAmount = Number(amount);
      
      if (user.walletBalance < numAmount) {
        throw new Error('Insufficient wallet balance');
      }

      // Process the airtime transaction first (before deducting wallet)
      const result = await serviceAPI.processAirtimeTransaction(user.id, {
        network: selectedNetwork.toLowerCase(),
        amount: numAmount,
        phoneNumber: phoneNumber,
      });
      
      // Only deduct from wallet if transaction was successful
      const newBalance = user.walletBalance - numAmount;
      await updateWalletBalance(newBalance);
      
      setTransaction(result);
      setIsSuccess(true);
      
      // Save beneficiary if requested
      if (saveAsBeneficiary && beneficiaryName) {
        await saveBeneficiary();
      }
      
      setStep(3);
    } catch (error: any) {
      console.error('Airtime purchase error:', error);
      
      // Set user-friendly error message
      let userErrorMessage = 'Failed to purchase airtime. Please try again.';
      
      if (error.message === 'Insufficient wallet balance') {
        userErrorMessage = 'Insufficient wallet balance. Please fund your wallet and try again.';
      } else if (error.message.includes('Unable to connect') || 
                 error.message.includes('internet connection')) {
        userErrorMessage = 'Unable to connect to payment service. Please check your internet connection and try again.';
      } else if (error.message.includes('Service temporarily unavailable') || 
                 error.message.includes('contact support')) {
        userErrorMessage = 'Payment service temporarily unavailable. Please try again later or contact support.';
      } else if (error.message.includes('timeout')) {
        userErrorMessage = 'Request timeout. Please check your internet connection and try again.';
      } else if (error.message) {
        userErrorMessage = error.message;
      }
      
      setErrorMessage(userErrorMessage);
      setIsSuccess(false);
      setStep(3);
    } finally {
      setIsLoading(false);
      setShowPinModal(false);
    }
  };

  const saveBeneficiary = async () => {
    if (!user || !selectedNetwork || !phoneNumber || !beneficiaryName) return;
    
    try {
      // Insert the beneficiary directly
      const { error } = await supabase
        .from('beneficiaries')
        .insert([{
          user_id: user.id,
          name: beneficiaryName,
          phone_number: phoneNumber,
          network: selectedNetwork,
          type: 'airtime'
        }]);
        
      if (error) {
        console.error('Error saving beneficiary:', error);
        return;
      }
      
      // Refresh beneficiaries list
      await fetchBeneficiaries();
    } catch (error) {
      console.error('Error saving beneficiary:', error);
    }
  };

  const selectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedNetwork(beneficiary.network);
    setPhoneNumber(beneficiary.phone_number);
    setBeneficiaryName(beneficiary.name);
    setShowBeneficiaries(false);
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
    setSelectedAmountValue(selectedAmount);
    // If network and phone number are already set, proceed to next step
    if (selectedNetwork && phoneNumber) {
      handleContinue();
    }
  };

  const renderStepOne = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-4">Airtime</h1>
        </div>
        <button
          onClick={() => navigate('/transactions')}
          className="text-primary-500 text-sm font-medium"
        >
          History
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Network and Phone Number Display */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div 
              className="relative"
              onClick={() => setShowNetworkSelector(!showNetworkSelector)}
            >
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden cursor-pointer border-2 border-gray-200 dark:border-gray-600">
                {selectedNetwork ? (
                  <img 
                    src={networkProviders.find(n => n.value === selectedNetwork)?.imageUrl} 
                    alt={selectedNetwork}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Network</span>
                )}
              </div>
              
              {/* Network Selector Dropdown */}
              {showNetworkSelector && (
                <div className="absolute top-14 left-0 z-10 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 w-48">
                  {networkProviders.map(provider => (
                    <div 
                      key={provider.value}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                      onClick={() => {
                        setSelectedNetwork(provider.value);
                        setShowNetworkSelector(false);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                        <img 
                          src={provider.imageUrl} 
                          alt={provider.label}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="font-medium">{provider.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          {/* Beneficiaries Dropdown */}
          {showBeneficiaries && beneficiaries.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mt-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">Recent Beneficiaries</h3>
              <div className="max-h-48 overflow-y-auto">
                {beneficiaries.map(beneficiary => (
                  <div 
                    key={beneficiary.id}
                    className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg cursor-pointer"
                    onClick={() => selectBeneficiary(beneficiary)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                      <User size={16} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{beneficiary.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{beneficiary.phone_number}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Top Up Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top up</h2>
          
          <div className="grid grid-cols-3 gap-3">
            {predefinedAmounts.map((item) => (
              <div 
                key={item.amount}
                onClick={() => handleAmountSelect(item.amount)}
                className={`rounded-xl p-4 cursor-pointer transition-all ${
                  selectedAmountValue === item.amount
                    ? 'bg-[#2C204D]/10 border-2 border-[#2C204D]'
                    : 'bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                }`}
              >
                <div className="flex flex-col h-full">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">₦{item.amount}</h3>
                  <div className="flex justify-end mt-auto">
                    <span className="font-bold text-[#2C204D]">₦{item.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                ₦
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setSelectedAmountValue(null); // Clear selected amount when custom amount is entered
                }}
                placeholder="50-500,000"
                min="50"
                max="500000"
                className="w-full pl-8 pr-4 py-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            
            <Button
              onClick={handleContinue}
              disabled={!selectedNetwork || !phoneNumber || !amount || Number(amount) < 50}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl text-center"
            >
              {amount ? `Pay ₦${amount}` : 'Pay'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            ₦50-500,000
          </p>
        </div>

        {/* Save as Beneficiary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Save as Beneficiary</span>
            <button
              onClick={() => setSaveAsBeneficiary(!saveAsBeneficiary)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                saveAsBeneficiary ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  saveAsBeneficiary ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {saveAsBeneficiary && (
            <div className="mt-3 animate-fade-in">
              <input
                type="text"
                value={beneficiaryName}
                onChange={(e) => setBeneficiaryName(e.target.value)}
                placeholder="Enter beneficiary name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStepTwo = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-4 flex items-center border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setStep(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white ml-4">Confirm Purchase</h1>
      </div>

      <div className="p-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Confirm Airtime Purchase</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Network</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {networkProviders.find(n => n.value === selectedNetwork)?.label}
              </span>
            </div>
            
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Phone Number</span>
              <span className="font-medium text-gray-900 dark:text-white">{phoneNumber}</span>
            </div>
            
            {saveAsBeneficiary && (
              <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Save as Beneficiary</span>
                <span className="font-medium text-gray-900 dark:text-white">{beneficiaryName}</span>
              </div>
            )}
            
            <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400">Amount</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(Number(amount))}</span>
            </div>
            
            <div className="flex justify-between py-3">
              <span className="text-gray-600 dark:text-gray-400">Wallet Balance</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(user?.walletBalance || 0)}</span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 py-3"
            >
              Back
            </Button>
            
            <Button
              onClick={handlePayment}
              isLoading={isLoading}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3"
            >
              Pay Now
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderStepThree = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 text-center">
        {isSuccess ? (
          <>
            <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-primary-500" size={32} />
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Purchase Successful!</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your airtime purchase of {formatCurrency(Number(amount))} was successful.
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6 text-left">
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Transaction ID</span>
                <span className="font-medium text-gray-900 dark:text-white">{transaction?.reference}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Phone Number</span>
                <span className="font-medium text-gray-900 dark:text-white">{phoneNumber}</span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Network</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {networkProviders.find(n => n.value === selectedNetwork)?.label}
                </span>
              </div>
              
              <div className="flex justify-between py-2">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(Number(amount))}</span>
              </div>
              
              {saveAsBeneficiary && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Saved Beneficiary</span>
                  <span className="font-medium text-gray-900 dark:text-white">{beneficiaryName}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Back to Home
              </Button>
              
              <Button
                onClick={() => {
                  setStep(1);
                  setSelectedNetwork('MTN');
                  setPhoneNumber('');
                  setAmount('');
                  setSelectedAmountValue(null);
                  setSaveAsBeneficiary(false);
                  setBeneficiaryName('');
                  setIsSuccess(null);
                  setTransaction(null);
                  setErrorMessage('');
                }}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white"
              >
                Buy Again
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="text-red-500" size={32} />
            </div>
            
            <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Purchase Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage || 'Your airtime purchase could not be completed. Please try again.'}
            </p>
            
            <Button
              onClick={() => {
                setStep(1);
                setIsSuccess(null);
                setErrorMessage('');
              }}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white"
            >
              Try Again
            </Button>
          </>
        )}
      </Card>
    </div>
  );

  return (
    <>
      {step === 1 && renderStepOne()}
      {step === 2 && renderStepTwo()}
      {step === 3 && renderStepThree()}

      {/* Transaction PIN Modal */}
      <TransactionPinModal
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={processPayment}
      />

      {/* Set PIN Modal */}
      <SetPinModal
        isOpen={showSetPinModal}
        onClose={() => setShowSetPinModal(false)}
        onSuccess={() => setStep(2)}
      />
    </>
  );
};

export default AirtimeServicePage;