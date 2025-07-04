import React from 'react';
import { Phone, Wifi, Zap, BookOpen, DollarSign, ShoppingBag } from 'lucide-react';
import { useServiceConfigStore } from '../../store/serviceConfigStore';
import ServiceCard from './ServiceCard';

const QuickActionSection: React.FC = () => {
  const { config: serviceConfig } = useServiceConfigStore();
  
  const getServiceStatus = (serviceId: string) => {
    return serviceConfig[serviceId] || 'active';
  };
  
  const services = [
    {
      title: 'Airtime',
      description: 'Recharge any network instantly',
      icon: <Phone size={20} />,
      path: '/services/airtime',
      color: 'bg-blue-500',
    },
    {
      title: 'Data',
      description: 'Buy data for any network',
      icon: <Wifi size={20} />,
      path: '/services/data',
      color: 'bg-green-500',
    },
    {
      title: 'Electricity',
      description: 'Pay electricity bills',
      icon: <Zap size={20} />,
      path: '/services/electricity',
      color: 'bg-amber-500',
    },
    {
      title: 'WAEC',
      description: 'Buy WAEC scratch cards',
      icon: <BookOpen size={20} />,
      path: '/services/waec',
      color: 'bg-purple-500',
    },
    {
      title: 'Shop',
      description: 'Browse our online store',
      icon: <ShoppingBag size={20} />,
      path: '/store',
      color: 'bg-primary-500',
    },
    {
      title: 'Fund Wallet',
      description: 'Add money to your wallet',
      icon: <DollarSign size={20} />,
      path: '/wallet/fund',
      color: 'bg-orange-500',
    },
  ];

  // Filter services based on their status
  const filteredServices = services.filter(service => {
    const status = getServiceStatus(service.path.split('/').pop() || '');
    return status !== 'disabled';
  });

  // Check if "More" button should be shown
  const showMoreButton = getServiceStatus('more') !== 'disabled';

  return (
    <div className="my-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            description={service.description}
            icon={service.icon}
            path={service.path}
            color={service.color}
          />
        ))}
      </div>
      
      {/* Only show the "More" button if it's not disabled */}
      {showMoreButton && filteredServices.length > 0 && (
        <div className="text-center mt-4">
          <a 
            href="/services" 
            className="inline-block text-primary-500 hover:text-primary-600 font-medium"
          >
            View More Services →
          </a>
        </div>
      )}
    </div>
  );
};

export default QuickActionSection;