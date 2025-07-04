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
  PlusCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useServiceConfigStore } from '../store/serviceConfigStore';
import { useAppSettingsStore } from '../store/appSettingsStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProductSlideshow from '../components/home/ProductSlideshow';
import RecentTransactions from '../components/home/RecentTransactions';
import { formatCurrency } from '../lib/utils';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config: serviceConfig, fetchConfig } = useServiceConfigStore();
  const { siteName } = useAppSettingsStore();
  const [showBalance, setShowBalance] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getServiceStatus = (serviceId: string) => {
    return serviceConfig[serviceId] || 'active';
  };

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

  const mainServices = [
    {
      title: 'Airtime',
      icon: <Phone size={20} />,
      path: '/services/airtime',
      color: 'text-indigo-600',
      id: 'airtime'
    },
    {
      title: 'Data',
      icon: <Wifi size={20} />,
      path: '/services/data',
      color: 'text-indigo-600',
      id: 'data'
    },
    {
      title: 'Electricity',
      icon: <Zap size={20} />,
      path: '/services/electricity',
      color: 'text-indigo-600',
      id: 'electricity'
    },
    {
      title: 'Support',
      icon: <MessageCircle size={20} />,
      path: '/support',
      color: 'text-indigo-600',
      id: 'support'
    },
  ];

  const secondaryServices = [
    {
      title: 'Redeem Voucher',
      icon: <Gift size={20} />,
      path: '/voucher',
      color: 'text-indigo-600',
      id: 'voucher',
      description: 'Redeem your vouchers and gift cards for amazing rewards and discounts'
    },
    { 
      title: 'TV', 
      icon: <Tv size={20} />,
      path: '/services/tv',
      color: 'text-indigo-600',
      id: 'tv',
      description: 'Pay for your TV subscriptions including DSTV, GOTV, and Startimes'
    },
    {
      title: 'Refer & Earn',
      icon: <Users size={20} />,
      path: '/refer',
      color: 'text-indigo-600',
      id: 'refer'
    },
    {
      title: 'More',
      icon: <MoreHorizontal size={20} />,
      path: '/services',
      color: 'text-indigo-600',
      id: 'more'
    },
  ];

  // Filter services based on their status
  const filteredMainServices = mainServices.filter(service => {
    const status = getServiceStatus(service.id);
    return status !== 'disabled';
  }).map(service => {
    const status = getServiceStatus(service.id);
    return {
      ...service,
      comingSoon: status === 'coming_soon'
    };
  });

  const filteredSecondaryServices = secondaryServices.filter(service => {
    // Special handling for "More" button
    if (service.id === 'more') {
      return getServiceStatus('more') !== 'disabled';
    }
    const status = getServiceStatus(service.id);
    return status !== 'disabled';
  }).map(service => {
    const status = getServiceStatus(service.id);
    return {
      ...service,
      comingSoon: status === 'coming_soon'
    };
  });
  //const navigate = useNavigate();
  //const { user } = useAuthStore();
  //const { config: serviceConfig, fetchConfig } = useServiceConfigStore();
  //const { siteName } = useAppSettingsStore();
  //const [showBalance, setShowBalance] = useState(true);
  //const [isDarkMode, setIsDarkMode] = useState(() => {
    //return document.documentElement.classList.contains('dark');
  //});

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

  const mainServices = [
    {
      title: 'Airtime',
      icon: <Phone size={20} />,
      path: '/services/airtime',
      color: 'text-indigo-600',
      id: 'airtime'
    },
    {
      title: 'Data',
      icon: <Wifi size={20} />,
      path: '/services/data',
      color: 'text-indigo-600',
      id: 'data'
    },
    {
      title: 'Electricity',
      icon: <Zap size={20} />,
      path: '/services/electricity',
      color: 'text-indigo-600',
      id: 'electricity'
    },
    {
      title: 'Support',
      icon: <MessageCircle size={20} />,
      path: '/support',
      color: 'text-indigo-600',
      id: 'support'
    },
  ];

  const secondaryServices = [
    {
      title: 'Redeem Voucher',
      icon: <Gift size={20} />,
      path: '/voucher',
      color: 'text-indigo-600',
      id: 'voucher',
      description: 'Redeem your vouchers and gift cards for amazing rewards and discounts'
    },
    { 
      title: 'TV', 
      icon: <Tv size={20} />,
      path: '/services/tv',
      color: 'text-indigo-600',
      id: 'tv',
      description: 'Pay for your TV subscriptions including DSTV, GOTV, and Startimes'
    },
    {
      title: 'Refer & Earn',
      icon: <Users size={20} />,
      path: '/refer',
      color: 'text-indigo-600',
      id: 'refer'
    },
    {
      title: 'More',
      icon: <MoreHorizontal size={20} />,
      path: '/services',
      color: 'text-indigo-600',
      id: 'more'
    },
  ];

  // Filter services based on their status
  const filteredMainServices = mainServices.filter(service => {
    const status = getServiceStatus(service.id);
    return status !== 'disabled';
  }).map(service => {
    const status = getServiceStatus(service.id);
    return {
      ...service,
      comingSoon: status === 'coming_soon'
    };
  });

  const filteredSecondaryServices = secondaryServices.filter(service => {
    const status = getServiceStatus(service.id);
    return status !== 'disabled';
  }).map(service => {
    const status = getServiceStatus(service.id);
    return {
      ...service,
      comingSoon: status === 'coming_soon'
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 sm:w-12 h-10 sm:h-12 bg-[#2C204D] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {getGreeting()}
              </p>
              <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {user?.name?.split(' ')[0] || 'User'}
              </p>
            </div>
          </div>
          
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
        </div>

        {/* Wallet Card */}
        <div className="relative mb-6 rounded-3xl overflow-hidden bg-wallet-bg text-white">
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 w-24 h-24 rounded-full bg-wallet-accent opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-wallet-accent opacity-20"></div>
          
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-sm opacity-80">Balance</p>
                <button 
                  onClick={toggleBalanceVisibility}
                  className="opacity-75 hover:opacity-100 transition-opacity ml-2"
                >
                  {showBalance ? (
                    <Eye size={14} />
                  ) : (
                    <EyeOff size={14} />
                  )}
                </button>
              </div>
              
              <div className="flex items-center">
                <History size={14} className="mr-2 opacity-80" />
                <button 
                  onClick={() => navigate('/transactions')}
                  className="text-xs sm:text-sm opacity-90 hover:opacity-100 transition-opacity"
                >
                  History
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <p className="text-3xl font-bold">
                {showBalance ? formatCurrency(user?.walletBalance || 0) : '****'}
              </p>
              
              <button 
                onClick={() => navigate('/wallet/fund')}
                className="flex items-center bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white/30 transition-all"
              >
                <PlusCircle size={14} className="mr-1" />
                Top up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="px-4 py-6">
        {/* Main Services */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {filteredMainServices.map((service, index) => (
            <button
              key={index}
              onClick={() => {
                if (service.comingSoon) {
                  handleComingSoonNavigation(service.title, service.description || '');
                } else {
                  navigate(service.path);
                }
              }}
              className="flex flex-col items-center space-y-2 relative"
            >
              {service.comingSoon && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  Soon
                </div>
              )}
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100">
                <div className={service.color}>
                  {service.icon}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight">
                {service.title}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Services */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {filteredSecondaryServices.map((service, index) => (
            <button
              key={index}
              onClick={() => {
                if (service.comingSoon) {
                  handleComingSoonNavigation(service.title, service.description || '');
                } else {
                  navigate(service.path);
                }
              }}
              className="flex flex-col items-center space-y-2 relative"
            >
              {service.comingSoon && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                  Soon
                </div>
              )}
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-100">
                <div className={service.color}>
                  {service.icon}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center leading-tight px-1">
                {service.title}
              </span>
            </button>
          ))}
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />

        {/* Product Slideshow Section */}
        {getServiceStatus('store') !== 'disabled' && (
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Latest Products</h2>
              <a href="/store" className="text-[#2C204D] text-sm font-medium">View All</a>
            </div>
            
            <ProductSlideshow />
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
              {getServiceStatus('store') !== 'disabled' && (
                <Card 
                  className="p-3 sm:p-4 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/store')}
                >
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShoppingBag size={16} className="text-green-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Shop</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Browse products</p>
                    </div>
                  </div>
                </Card>
              )}

              {getServiceStatus('waec') === 'coming_soon' && (
                <Card 
                  className="p-3 sm:p-4 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow relative"
                  onClick={() => handleComingSoonNavigation('Education Services', 'Access educational services, course payments, and academic resources')}
                >
                  <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    Soon
                  </div>
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen size={16} className="text-purple-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Education</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">WAEC & more</p>
                    </div>
                  </div>
                </Card>
              )}

              {getServiceStatus('store') !== 'disabled' && (
                <Card 
                  className="p-3 sm:p-4 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/store/orders')}
                >
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Package size={16} className="text-blue-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Orders</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Track orders</p>
                    </div>
                  </div>
                </Card>
              )}

              {getServiceStatus('support') !== 'disabled' && (
                <Card 
                  className="p-3 sm:p-4 bg-white dark:bg-gray-800 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate('/support')}
                >
                  <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <MessageCircle size={16} className="text-orange-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-gray-900 dark:text-white text-xs sm:text-sm">Support</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Get help</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;