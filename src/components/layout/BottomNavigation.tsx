import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, TrendingUp, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { cn } from '../../lib/utils';

const navigationItems = [
  {
    name: 'Home',
    path: '/',
    icon: Home,
  },
  {
    name: 'Shop',
    path: '/store',
    icon: ShoppingBag,
  },
  {
    name: 'Refer & Earn',
    path: '/refer',
    icon: TrendingUp,
  },
  {
    name: 'Profile',
    path: '/profile',
    icon: User,
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