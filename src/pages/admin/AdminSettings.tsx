import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Settings, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Image, 
  Type, 
  FileText, 
  ToggleLeft, 
  ToggleRight,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Wifi,
  Zap,
  BookOpen,
  ShoppingBag,
  Gift,
  Tv,
  MessageCircle,
  Users,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useServiceConfigStore, ServiceStatus } from '../../store/serviceConfigStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

type Setting = {
  id: string;
  key: string;
  value: string;
  description?: string;
  updated_at: string;
  updated_by?: string;
};

type SettingGroup = {
  title: string;
  icon: React.ReactNode;
  settings: Setting[];
};

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { config: serviceConfig, updateServiceStatus } = useServiceConfigStore();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, ServiceStatus>>({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  useEffect(() => {
    // Initialize service statuses from config
    const statuses: Record<string, ServiceStatus> = {};
    Object.entries(serviceConfig).forEach(([key, value]) => {
      // Extract service name from key (e.g., service_airtime_status -> airtime)
      const serviceName = key.replace('service_', '').replace('_status', '');
      statuses[serviceName] = value as ServiceStatus;
    });
    setServiceStatuses(statuses);
  }, [serviceConfig]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchSettings();
      setMessage({ type: 'success', text: 'Settings refreshed successfully' });
    } catch (error) {
      console.error('Error refreshing settings:', error);
      setMessage({ type: 'error', text: 'Failed to refresh settings' });
    } finally {
      setRefreshing(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSettingChange = (id: string, value: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, value } : setting
      )
    );
  };

  const handleServiceStatusChange = (service: string, status: ServiceStatus) => {
    setServiceStatuses(prev => ({
      ...prev,
      [service]: status
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Update settings in database
      for (const setting of settings) {
        const { error } = await supabase
          .from('admin_settings')
          .update({ 
            value: setting.value,
            updated_by: user?.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', setting.id);

        if (error) throw error;
      }

      // Update service statuses
      for (const [service, status] of Object.entries(serviceStatuses)) {
        await updateServiceStatus(service, status);
      }

      setMessage({ type: 'success', text: 'Settings saved successfully' });
      
      // Log admin action
      await supabase.from('admin_logs').insert([{
        admin_id: user?.id,
        action: 'update_settings',
        details: { 
          timestamp: new Date().toISOString(),
          settings_updated: settings.length,
          services_updated: Object.keys(serviceStatuses).length
        },
      }]);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // Group settings by category
  const groupSettings = (): SettingGroup[] => {
    const generalSettings = settings.filter(s => 
      s.key.startsWith('site_') || 
      s.key === 'maintenance_mode' ||
      s.key === 'app_base_url'
    );
    
    const contactSettings = settings.filter(s => 
      s.key.startsWith('support_') || 
      s.key.startsWith('footer_')
    );
    
    const homepageSettings = settings.filter(s => 
      s.key.startsWith('hero_') || 
      s.key.startsWith('steps_') ||
      s.key.startsWith('download_app_')
    );
    
    const referralSettings = settings.filter(s => 
      s.key.startsWith('referral_')
    );
    
    return [
      {
        title: 'General Settings',
        icon: <Settings size={20} />,
        settings: generalSettings
      },
      {
        title: 'Contact Information',
        icon: <Mail size={20} />,
        settings: contactSettings
      },
      {
        title: 'Homepage Content',
        icon: <FileText size={20} />,
        settings: homepageSettings
      },
      {
        title: 'Referral System',
        icon: <Users size={20} />,
        settings: referralSettings
      }
    ];
  };

  // Service configuration
  const services = [
    { id: 'airtime', name: 'Airtime Service', icon: <Phone size={20} /> },
    { id: 'data', name: 'Data Service', icon: <Wifi size={20} /> },
    { id: 'electricity', name: 'Electricity Service', icon: <Zap size={20} /> },
    { id: 'waec', name: 'WAEC Service', icon: <BookOpen size={20} /> },
    { id: 'tv', name: 'TV Service', icon: <Tv size={20} /> },
    { id: 'store', name: 'Store Service', icon: <ShoppingBag size={20} /> },
    { id: 'voucher', name: 'Voucher Service', icon: <Gift size={20} /> },
    { id: 'support', name: 'Support Service', icon: <MessageCircle size={20} /> },
    { id: 'refer', name: 'Refer & Earn', icon: <Users size={20} /> },
    { id: 'more', name: 'More Button', icon: <MoreHorizontal size={20} /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F9D58]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors mr-4"
              >
                <ArrowLeft size={24} className="text-gray-700 dark:text-gray-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Configure application settings</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                isLoading={refreshing}
                icon={<RefreshCw size={16} />}
              >
                Refresh
              </Button>
              <Button
                onClick={handleSaveSettings}
                isLoading={saving}
                className="bg-[#0F9D58] hover:bg-[#0d8a4f] text-white"
                icon={<Save size={16} />}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="text-green-500 dark:text-green-400 mr-3" size={20} />
            ) : (
              <AlertTriangle className="text-red-500 dark:text-red-400 mr-3" size={20} />
            )}
            <span className={message.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
              {message.text}
            </span>
          </div>
        )}

        {/* Service Configuration */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Globe className="mr-2 text-[#0F9D58]" size={20} />
            Service Configuration
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-[#0F9D58]/10 flex items-center justify-center mr-3">
                    {service.icon}
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{service.name}</span>
                </div>
                
                <div>
                  <select
                    value={serviceStatuses[service.id] || 'active'}
                    onChange={(e) => handleServiceStatusChange(service.id, e.target.value as ServiceStatus)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
                  >
                    <option value="active">Active</option>
                    <option value="coming_soon">Coming Soon</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Settings Groups */}
        {groupSettings().map((group, index) => (
          <Card key={index} className="mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              {group.icon}
              <span className="ml-2">{group.title}</span>
            </h2>
            
            <div className="space-y-6">
              {group.settings.map((setting) => (
                <div key={setting.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {setting.key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </label>
                    {setting.description && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{setting.description}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    {setting.key === 'maintenance_mode' || setting.key === 'download_app_enabled' ? (
                      <div className="flex items-center">
                        <button
                          onClick={() => handleSettingChange(setting.id, setting.value === 'true' ? 'false' : 'true')}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F9D58] focus:ring-offset-2"
                          style={{
                            backgroundColor: setting.value === 'true' ? '#0F9D58' : '#D1D5DB'
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              setting.value === 'true' ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ) : setting.key.includes('image') || setting.key.includes('logo') ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={setting.value}
                          onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
                        />
                        {setting.value && (
                          <div className="mt-2">
                            <img
                              src={setting.value}
                              alt={setting.key}
                              className="h-20 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://via.placeholder.com/150?text=Invalid+Image+URL';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={setting.value}
                        onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0F9D58]"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            isLoading={saving}
            className="bg-[#0F9D58] hover:bg-[#0d8a4f] text-white"
            icon={<Save size={16} />}
          >
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;