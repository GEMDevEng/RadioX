import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiDownload, FiShare2, FiCode, FiCopy, FiCheck } from 'react-icons/fi';
import api from '../services/api';
import { toast } from 'react-toastify';

const ExportOptions = ({ item, type }) => {
  const { t } = useTranslation();
  const [exportFormat, setExportFormat] = useState('mp3');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/export/${type}/${item._id}?format=${exportFormat}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${item.title}.${exportFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Track download
      await api.post('/analytics/track', {
        action: 'download',
        itemId: item._id,
        itemType: type,
        format: exportFormat
      });
      
      toast.success(t('export.downloadSuccess'));
    } catch (err) {
      console.error('Download error:', err);
      toast.error(t('export.downloadError'));
    } finally {
      setLoading(false);
    }
  };
  
  const handleShare = async (platform) => {
    try {
      setLoading(true);
      // Get shareable link
      const response = await api.get(`/share/${type}/${item._id}`);
      const shareUrl = response.data.shareUrl;
      
      // Share based on platform
      let shareLink;
      switch (platform) {
        case 'twitter':
          shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(item.title)}`;
          break;
        case 'facebook':
          shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
          break;
        case 'linkedin':
          shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
          break;
        default:
          // Copy to clipboard
          navigator.clipboard.writeText(shareUrl);
          toast.success(t('export.linkCopied'));
          setShowShareOptions(false);
          setLoading(false);
          return;
      }
      
      // Open share window
      window.open(shareLink, '_blank', 'width=600,height=400');
      
      // Track share
      await api.post('/analytics/track', {
        action: 'share',
        itemId: item._id,
        itemType: type,
        platform
      });
      
      setShowShareOptions(false);
    } catch (err) {
      console.error('Share error:', err);
      toast.error(t('export.shareError'));
    } finally {
      setLoading(false);
    }
  };
  
  const getEmbedCode = () => {
    const embedUrl = `${window.location.origin}/embed/${type}/${item._id}`;
    return `<iframe width="100%" height="166" scrolling="no" frameborder="no" src="${embedUrl}"></iframe>`;
  };
  
  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {/* Download options */}
      <div className="relative">
        <button
          onClick={handleDownload}
          disabled={loading}
          className="flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
        >
          <FiDownload className="mr-1" />
          {loading ? t('common.loading') : t('export.download')}
        </button>
        <select
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="ml-1 text-sm bg-gray-100 dark:bg-gray-700 border-none rounded-md"
        >
          <option value="mp3">MP3</option>
          <option value="wav">WAV</option>
          <option value="ogg">OGG</option>
        </select>
      </div>
      
      {/* Share options */}
      <div className="relative">
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          disabled={loading}
          className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm disabled:opacity-50"
        >
          <FiShare2 className="mr-1" />
          {t('export.share')}
        </button>
        
        {showShareOptions && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 py-1 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => handleShare('copy')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiCopy className="mr-2" />
              {t('export.copyLink')}
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-2">𝕏</span>
              {t('export.shareOnTwitter')}
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-2">f</span>
              {t('export.shareOnFacebook')}
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="mr-2">in</span>
              {t('export.shareOnLinkedIn')}
            </button>
          </div>
        )}
      </div>
      
      {/* Embed options */}
      <div className="relative">
        <button
          onClick={() => setShowEmbedCode(!showEmbedCode)}
          className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
        >
          <FiCode className="mr-1" />
          {t('export.embed')}
        </button>
        
        {showEmbedCode && (
          <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 p-3 border border-gray-200 dark:border-gray-700">
            <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('export.embedCode')}
            </div>
            <div className="relative">
              <textarea
                readOnly
                value={getEmbedCode()}
                className="w-full h-24 p-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md"
              />
              <button
                onClick={copyEmbedCode}
                className="absolute top-2 right-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                title={t('export.copyCode')}
              >
                {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {t('export.embedInstructions')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportOptions;
