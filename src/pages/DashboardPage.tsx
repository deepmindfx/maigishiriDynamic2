import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Wifi, 
  Zap, 
  Tv, 
  Gift, 
  Ticket, 
  Users, 
  MoreHorizontal,
  Eye,
  EyeOff,
  History,
  Plus,
  ShoppingBag,
  BookOpen,
  Moon,
  Sun,
  Package,
  MessageCircle,
  ArrowUpRight,
  Upload,
  DollarSign,
  Ban,
  CreditCard,
  Bell,
  Shield
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceConfigStore } from '../store/serviceConfigStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProductSlideshow from '../components/home/ProductSlideshow';
import { formatCurrency } from '../lib/utils';
import RecentTransactions from '../components/home/RecentTransactions';
import DashboardActionButton from '../components/dashboard/DashboardActionButton';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config: serviceConfig, fetchConfig } = useServiceConfigStore();
  const [showBalance, setShowBalance] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleComingSoonNavigation = (serviceName: string, serviceDescription: string) => {
    navigate('/coming-soon', { 
      state: { 
        serviceName, 
        serviceDescription 
      } 
    });
  };

  const getServiceStatus = (serviceId: string) => {
    return serviceConfig[serviceId] || 'active';
  };

  const quickActions = [
    {
      icon: <Ban size={24} className="text-indigo-600" />,
      label: 'Transfer',
      path: '/coming-soon',
      comingSoon: true
    },
    {
      icon: <Upload size={24} className="text-indigo-600" />,
      label: 'Payment',
      path: '/services',
      comingSoon: false
    },
    {
      icon: <ArrowUpRight size={24} className="text-indigo-600" />,
      label: 'Payout',
      path: '/coming-soon',
      comingSoon: true
    },
    {
      icon: <Plus size={24} className="text-indigo-600" />,
      label: 'Top up',
      path: '/wallet/fund',
      comingSoon: false
    }
  ];

  const promotionalBanners = [
    {
      id: 2,
      title: 'Shop with Confidence',
      subtitle: 'Discover amazing deals on electronics and gadgets',
      image: 'https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg',
      buttonText: 'Shop Now',
      bgColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Active</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon size={18} className="text-gray-600 dark:text-gray-400" />
              )}
            </button>
            
            <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-green-600 text-white font-bold text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Balance Card */}
        <div className="mt-6 bg-wallet-purple-500 text-white rounded-4xl p-6 shadow-lg">
          <div className="flex justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Balance</p>
              <div className="flex items-center">
                <p className="text-3xl font-bold">
                  {showBalance ? formatCurrency(user?.walletBalance || 0) : '****'}
                </p>
                <button 
                  onClick={toggleBalanceVisibility}
                  className="ml-2 opacity-75 hover:opacity-100 transition-opacity"
                >
                  {showBalance ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-white/80 text-sm mb-1">Card</p>
              <p className="text-2xl font-bold">
                {user?.virtualAccountBankName || 'Virtual Account'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <DashboardActionButton
                key={index}
                icon={action.icon}
                label={action.label}
                path={action.path}
                comingSoon={action.comingSoon}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Last Transaction</h2>
            <a href="/transactions" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              View All
            </a>
          </div>
          
          <RecentTransactions />
        </div>

        {/* Product Slideshow Section */}
        {getServiceStatus('store') !== 'disabled' && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Latest Products</h2>
              <a href="/store" className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">View All</a>
            </div>
            
            <ProductSlideshow />
          </div>
        )}

        {/* Promotional Banners */}
        {getServiceStatus('store') !== 'disabled' && (
          <div className="mt-8 space-y-4">
            {promotionalBanners.map((banner) => (
              <Card key={banner.id} className={`${banner.bgColor} text-white p-4 sm:p-6 overflow-hidden relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 pr-4">
                    <h3 className="text-base sm:text-lg font-bold mb-2">{banner.title}</h3>
                    <p className="text-sm opacity-90 mb-4 leading-relaxed">
                      {banner.subtitle}
                    </p>
                    
                    <div className="flex space-x-3">
                      <button 
                        onClick={() => navigate('/store')}
                        className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-30 transition-all"
                      >
                        📱 {banner.buttonText}
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-20 sm:w-24 h-20 sm:h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-wallet-purple-500 rounded-t-3xl p-4 flex justify-around items-center">
        <button className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center text-white">
            <CreditCard size={20} />
          </div>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center text-white">
            <DollarSign size={20} />
          </div>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center text-white">
            <Bell size={20} />
          </div>
        </button>
        <button className="flex flex-col items-center">
          <div className="w-8 h-8 flex items-center justify-center text-white">
            <Shield size={20} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;