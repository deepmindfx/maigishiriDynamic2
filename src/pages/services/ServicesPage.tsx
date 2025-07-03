import React, { useEffect } from 'react';
import { Phone, Wifi, Zap, BookOpen, ShoppingBag, Package, Tv, Gift, MessageCircle, Users } from 'lucide-react';
import { useServiceConfigStore } from '../../store/serviceConfigStore';

const ServicesPage: React.FC = () => {
  const { config: serviceConfig, fetchConfig } = useServiceConfigStore();

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const getServiceStatus = (serviceId: string) => {
    return serviceConfig[serviceId] || 'active';
  };

  const services = [
    {
      title: 'Airtime Recharge',
      description: 'Buy airtime for any network instantly',
      icon: <Phone size={24} className="text-indigo-600" />,
      path: '/services/airtime',
      id: 'airtime'
    },
    {
      title: 'Data Bundles',
      description: 'Purchase data plans for any network',
      icon: <Wifi size={24} className="text-indigo-600" />,
      path: '/services/data',
      id: 'data'
    },
    {
      title: 'Electricity Bills',
      description: 'Pay electricity bills for any DISCO',
      icon: <Zap size={24} className="text-indigo-600" />,
      path: '/services/electricity',
      id: 'electricity'
    },
    {
      title: 'TV Subscriptions',
      description: 'Pay for DSTV, GOTV, and Startimes',
      icon: <Tv size={24} className="text-indigo-600" />,
      path: '/services/tv',
      id: 'tv'
    },
    {
      title: 'WAEC Scratch Cards',
      description: 'Purchase WAEC scratch cards instantly',
      icon: <BookOpen size={24} className="text-indigo-600" />,
      path: '/services/waec',
      id: 'waec'
    },
    {
      title: 'E-commerce Store',
      description: 'Shop from our wide range of electronics and gadgets',
      icon: <ShoppingBag size={24} className="text-indigo-600" />,
      path: '/store',
      id: 'store'
    },
    {
      title: 'Support',
      description: 'Get help with any issues',
      icon: <MessageCircle size={24} className="text-indigo-600" />,
      path: '/support',
      id: 'support'
    },
    {
      title: 'Refer & Earn',
      description: 'Invite friends and earn rewards',
      icon: <Users size={24} className="text-indigo-600" />,
      path: '/refer',
      id: 'refer'
    },
  ];

  // Filter services based on their status
  const filteredServices = services.filter(service => {
    const status = getServiceStatus(service.id);
    return status !== 'disabled';
  }).map(service => {
    const status = getServiceStatus(service.id);
    return {
      ...service,
      path: status === 'coming_soon' ? '/coming-soon' : service.path,
      state: status === 'coming_soon' ? { 
        serviceName: service.title, 
        serviceDescription: service.description 
      } : undefined,
      comingSoon: status === 'coming_soon'
    };
  });

  return (
    <div className="py-6 animate-fade-in">
      <h1 className="text-2xl font-semibold mb-6">Our Services</h1>
      
      {/* Services Grid */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {filteredServices.map((service, index) => (
          <div key={index} className="flex flex-col items-center relative">
            {service.comingSoon && (
              <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold z-10">
                Soon
              </div>
            )}
            <a 
              href={service.path}
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md mb-2 border border-gray-100"
            >
              {service.icon}
            </a>
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
              {service.title}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
          <ol className="space-y-4">
            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#0F9D58] flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Select a Service</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose from our range of digital services or browse our e-commerce store
                </p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#0F9D58] flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Fill in Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter the required information for your selected service or add items to cart
                </p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#0F9D58] flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Make Payment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Pay using your wallet or other payment methods
                </p>
              </div>
            </li>
            
            <li className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#0F9D58] flex items-center justify-center text-white font-bold">
                4
              </div>
              <div className="ml-4">
                <h3 className="font-medium">Get Value Instantly</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your service is processed immediately or your products are delivered to you
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Service Categories Info */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3 text-[#0F9D58]">Digital Services</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Pay all your bills instantly with our comprehensive digital services platform. 
            From airtime and data to electricity bills and educational payments, we've got you covered.
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-3 text-[#0F9D58]">E-commerce Store</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Shop from our curated collection of electronics, gadgets, and accessories. 
            Enjoy fast delivery, secure payments, and quality products at competitive prices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;