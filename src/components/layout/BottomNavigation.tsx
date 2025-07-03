import React from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, BarChart2, Bell, Hexagon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const navigationItems = [
  {
    name: 'Home',
    path: '/',
    icon: Wallet, // Represents Home/Dashboard (wallet icon from image)
  },
  {
    name: 'Shop',
    path: '/store',
    icon: BarChart2, // Represents Shop (bar chart icon from image)
  },
  {
    name: 'Refer & Earn',
    path: '/refer',
    icon: Bell, // Represents Refer & Earn (bell icon from image)
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: Hexagon, // Represents Profile (hexagon icon from image)
  },
];

const BottomNavigation: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Only show bottom navigation when user is authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-16 bg-bottomNav-bg rounded-full flex items-center justify-around z-50 px-2 sm:px-6 shadow-lg safe-area-pb">
      {navigationItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className="flex-1 flex items-center justify-center h-full"
          end
        >
          {({ isActive }) => {
            const IconComponent = item.icon;
            return (
              <div className={cn(
                'flex items-center justify-center w-12 h-12 rounded-full transition-colors duration-200',
                isActive ? 'bg-bottomNav-active' : 'bg-transparent'
              )}>
                <IconComponent
                  size={20}
                  className={cn(
                    isActive ? 'text-white' : 'text-gray-400'
                  )}
                />
              </div>
            );
          }}
        </NavLink>
      ))}
    </div>
  );
};

export default BottomNavigation;