import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiToggleLeft, FiToggleRight, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import api from '../../services/api';
import Card from '../../components/Card';
import Spinner from '../../components/Spinner';

const FeatureFlagsPage = () => {
  const { t } = useTranslation();
  const [featureFlags, setFeatureFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentFlag, setCurrentFlag] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    userPercentage: 0,
    userIds: []
  });
  
  // Fetch feature flags
  const fetchFeatureFlags = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/feature-flags/admin');
      setFeatureFlags(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch feature flags');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchFeatureFlags();
  }, []);
  
  // Toggle feature flag
  const handleToggle = async (flagName) => {
    try {
      await api.patch(`/api/feature-flags/admin/${flagName}/toggle`);
      fetchFeatureFlags();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle feature flag');
    }
  };
  
  // Delete feature flag
  const handleDelete = async (flagName) => {
    if (window.confirm(t('admin.featureFlags.deleteConfirm'))) {
      try {
        await api.delete(`/api/feature-flags/admin/${flagName}`);
        fetchFeatureFlags();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete feature flag');
      }
    }
  };
  
  // Open modal for creating/editing
  const openModal = (flag = null) => {
    if (flag) {
      setCurrentFlag(flag);
      setFormData({
        name: flag.name,
        description: flag.description,
        enabled: flag.enabled,
        userPercentage: flag.userPercentage,
        userIds: flag.userIds.join(', ')
      });
    } else {
      setCurrentFlag(null);
      setFormData({
        name: '',
        description: '',
        enabled: false,
        userPercentage: 0,
        userIds: []
      });
    }
    setShowModal(true);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        userPercentage: parseInt(formData.userPercentage),
        userIds: formData.userIds ? formData.userIds.split(',').map(id => id.trim()) : []
      };
      
      if (currentFlag) {
        // Update existing flag
        await api.put(`/api/feature-flags/admin/${currentFlag.name}`, payload);
      } else {
        // Create new flag
        await api.post('/api/feature-flags/admin', payload);
      }
      
      setShowModal(false);
      fetchFeatureFlags();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save feature flag');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.featureFlags.title')}</h1>
        <button
          className="btn-primary flex items-center"
          onClick={() => openModal()}
        >
          <FiPlus className="mr-2" />
          {t('admin.featureFlags.create')}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {featureFlags.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {t('admin.featureFlags.noFlags')}
          </p>
        </Card>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.featureFlags.name')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.featureFlags.description')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.featureFlags.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('admin.featureFlags.rollout')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('common.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {featureFlags.map((flag) => (
                <tr key={flag.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {flag.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {flag.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      className="flex items-center text-sm"
                      onClick={() => handleToggle(flag.name)}
                    >
                      {flag.enabled ? (
                        <>
                          <FiToggleRight className="text-green-500 text-xl mr-2" />
                          <span className="text-green-500 font-medium">
                            {t('admin.featureFlags.enabled')}
                          </span>
                        </>
                      ) : (
                        <>
                          <FiToggleLeft className="text-gray-400 text-xl mr-2" />
                          <span className="text-gray-500 font-medium">
                            {t('admin.featureFlags.disabled')}
                          </span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {flag.userPercentage > 0 ? (
                        <span>{flag.userPercentage}% {t('admin.featureFlags.ofUsers')}</span>
                      ) : flag.userIds.length > 0 ? (
                        <span>{flag.userIds.length} {t('admin.featureFlags.specificUsers')}</span>
                      ) : (
                        <span>{t('admin.featureFlags.allUsers')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      onClick={() => openModal(flag)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDelete(flag.name)}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal for creating/editing feature flags */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {currentFlag
                ? t('admin.featureFlags.edit')
                : t('admin.featureFlags.create')}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!!currentFlag}
                  className="form-input w-full"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.description')}
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input w-full"
                  rows="3"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={formData.enabled}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {t('admin.featureFlags.enabled')}
                  </span>
                </label>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.userPercentage')}
                </label>
                <input
                  type="number"
                  name="userPercentage"
                  value={formData.userPercentage}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="form-input w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.featureFlags.percentageHelp')}
                </p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.userIds')}
                </label>
                <textarea
                  name="userIds"
                  value={formData.userIds}
                  onChange={handleChange}
                  className="form-input w-full"
                  rows="2"
                  placeholder="user1, user2, user3"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('admin.featureFlags.userIdsHelp')}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureFlagsPage;
