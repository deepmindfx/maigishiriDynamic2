import React from 'react';
import { useNavigate } from 'react-router-dom';

type DashboardActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  path: string;
  comingSoon?: boolean;
};

const DashboardActionButton: React.FC<DashboardActionButtonProps> = ({
  icon,
  label,
  path,
  comingSoon = false
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (comingSoon) {
      navigate('/coming-soon', { 
        state: { 
          serviceName: label, 
          serviceDescription: `${label} service will be available soon.` 
        } 
      });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="flex flex-col items-center" onClick={handleClick}>
      <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-2">
        {icon}
      </div>
      <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">{label}</span>
    </div>
  );
};

export default DashboardActionButton;