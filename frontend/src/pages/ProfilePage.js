import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { currentUser, updateProfile, connectXAccount, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showXConnectModal, setShowXConnectModal] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Settings state
  const [settings, setSettings] = useState({
    defaultVoice: 'en-US-Standard-D',
    defaultMusicVolume: 0.1,
    notificationsEnabled: true,
    theme: 'system',
  });
  
  // X connection state
  const [xConnectionData, setXConnectionData] = useState({
    username: '',
    apiKey: '',
    apiSecret: '',
  });

  // Initialize form data from current user
  useEffect(() => {
    if (currentUser) {
      setFormData({
        ...formData,
        name: currentUser.name || '',
        email: currentUser.email || '',
      });
      
      if (currentUser.settings) {
        setSettings(currentUser.settings);
      }
    }
  }, [currentUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleXConnectionChange = (e) => {
    const { name, value } = e.target;
    setXConnectionData({
      ...xConnectionData,
      [name]: value,
    });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Validate passwords if changing
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('Current password is required to set a new password');
        return;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }
      
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        return;
      }
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const userData = {
        name: formData.name,
        email: formData.email,
        settings,
      };
      
      if (formData.newPassword) {
        userData.currentPassword = formData.currentPassword;
        userData.password = formData.newPassword;
      }
      
      await updateProfile(userData);
      
      setSuccess('Profile updated successfully');
      
      // Reset password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectX = async (e) => {
    e.preventDefault();
    
    if (!xConnectionData.username || !xConnectionData.apiKey || !xConnectionData.apiSecret) {
      setError('All fields are required to connect your X account');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Mock token data for demonstration
      const tokenData = {
        apiKey: xConnectionData.apiKey,
        apiSecret: xConnectionData.apiSecret,
        accessToken: 'mock-access-token',
        accessTokenSecret: 'mock-access-token-secret',
      };
      
      await connectXAccount(xConnectionData.username, tokenData);
      
      setSuccess('X account connected successfully');
      setShowXConnectModal(false);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to connect X account');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectX = async () => {
    if (window.confirm('Are you sure you want to disconnect your X account?')) {
      try {
        // In a real implementation, we would call the API
        // await api.delete('/auth/disconnect-x');
        
        // Update user context
        await connectXAccount('', null);
        
        setSuccess('X account disconnected successfully');
        
      } catch (err) {
        setError('Failed to disconnect X account');
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      const confirmDelete = window.prompt('Type "DELETE" to confirm account deletion:');
      
      if (confirmDelete === 'DELETE') {
        try {
          // In a real implementation, we would call the API
          // await api.delete('/auth/account');
          
          // Log out the user
          logout();
          
          // Redirect to home page would happen automatically due to auth context
          
        } catch (err) {
          setError('Failed to delete account');
        }
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <div className="card p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl font-bold mb-4">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-xl font-semibold">{currentUser?.name}</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {currentUser?.email}
              </p>
              
              {currentUser?.xApiConnection?.connected ? (
                <div className="w-full">
                  <div className="flex items-center justify-center mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg
                        className="mr-1.5 h-2 w-2 text-green-400"
                        fill="currentColor"
                        viewBox="0 0 8 8"
                      >
                        <circle cx="4" cy="4" r="3" />
                      </svg>
                      X Connected
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Connected as @{currentUser.xApiConnection.username}
                  </p>
                  <button
                    className="btn-outline text-sm w-full"
                    onClick={handleDisconnectX}
                  >
                    Disconnect X Account
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary w-full"
                  onClick={() => setShowXConnectModal(true)}
                >
                  Connect X Account
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2">
          {/* Profile Information */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="mb-4">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <h3 className="text-lg font-semibold mb-3 mt-6">Change Password</h3>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="form-label">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  className="form-input"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="form-label">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  className="form-input"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  minLength="6"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className="form-input"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <form>
              <div className="mb-4">
                <label htmlFor="defaultVoice" className="form-label">
                  Default Voice
                </label>
                <select
                  id="defaultVoice"
                  name="defaultVoice"
                  className="form-input"
                  value={settings.defaultVoice}
                  onChange={handleSettingsChange}
                >
                  <option value="en-US-Standard-D">English (US) - Male</option>
                  <option value="en-US-Standard-F">English (US) - Female</option>
                  <option value="en-GB-Standard-B">English (UK) - Male</option>
                  <option value="en-GB-Standard-A">English (UK) - Female</option>
                  <option value="es-ES-Standard-B">Spanish - Male</option>
                  <option value="es-ES-Standard-A">Spanish - Female</option>
                  <option value="fr-FR-Standard-B">French - Male</option>
                  <option value="fr-FR-Standard-A">French - Female</option>
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="defaultMusicVolume" className="form-label">
                  Default Background Music Volume: {settings.defaultMusicVolume * 100}%
                </label>
                <input
                  type="range"
                  id="defaultMusicVolume"
                  name="defaultMusicVolume"
                  min="0"
                  max="1"
                  step="0.1"
                  className="w-full"
                  value={settings.defaultMusicVolume}
                  onChange={handleSettingsChange}
                />
              </div>

              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    className="form-checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={handleSettingsChange}
                  />
                  <span className="ml-2">Enable email notifications</span>
                </label>
              </div>

              <div className="mb-6">
                <label htmlFor="theme" className="form-label">
                  Theme
                </label>
                <select
                  id="theme"
                  name="theme"
                  className="form-input"
                  value={settings.theme}
                  onChange={handleSettingsChange}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>

              <button
                type="button"
                className="btn-primary"
                onClick={handleProfileUpdate}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card p-6 border border-red-300 dark:border-red-700">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              className="btn-outline text-red-600 border-red-600 hover:bg-red-50"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* X Connect Modal */}
      {showXConnectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Connect X Account</h2>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowXConnectModal(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Connect your X account to enable post searching and conversion.
              </p>

              <form onSubmit={handleConnectX}>
                <div className="mb-4">
                  <label htmlFor="username" className="form-label">
                    X Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500">@</span>
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="form-input pl-7"
                      placeholder="username"
                      value={xConnectionData.username}
                      onChange={handleXConnectionChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="apiKey" className="form-label">
                    API Key
                  </label>
                  <input
                    type="text"
                    id="apiKey"
                    name="apiKey"
                    className="form-input"
                    value={xConnectionData.apiKey}
                    onChange={handleXConnectionChange}
                    required
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="apiSecret" className="form-label">
                    API Secret
                  </label>
                  <input
                    type="password"
                    id="apiSecret"
                    name="apiSecret"
                    className="form-input"
                    value={xConnectionData.apiSecret}
                    onChange={handleXConnectionChange}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setShowXConnectModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Connecting...' : 'Connect Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
