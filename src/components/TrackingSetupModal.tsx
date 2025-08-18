"use client";

import { useState } from 'react';
import { X, Bell, Mail, MessageSquare, CheckCircle } from 'lucide-react';

interface TrackingSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: TrackingPreferences) => void;
  contractTitle: string;
  loading?: boolean;
}

interface TrackingPreferences {
  email_alerts: boolean;
  whatsapp_alerts: boolean;
  push_alerts: boolean;
  deadline_reminders: boolean;
  status_updates: boolean;
  document_updates: boolean;
}

export default function TrackingSetupModal({
  isOpen,
  onClose,
  onSave,
  contractTitle,
  loading = false
}: TrackingSetupModalProps) {
  const [preferences, setPreferences] = useState<TrackingPreferences>({
    email_alerts: true,
    whatsapp_alerts: false,
    push_alerts: true,
    deadline_reminders: true,
    status_updates: true,
    document_updates: true
  });

  const handleSave = () => {
    onSave(preferences);
  };

  const togglePreference = (key: keyof TrackingPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Track Contract</h2>
            <p className="text-sm text-gray-600 mt-1">{contractTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alert Channels */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Alert Channels</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email_alerts}
                  onChange={() => togglePreference('email_alerts')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">Email notifications</span>
              </label>
              
                             <label className="flex items-center space-x-3 cursor-pointer">
                 <input
                   type="checkbox"
                   checked={preferences.whatsapp_alerts}
                   onChange={() => togglePreference('whatsapp_alerts')}
                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                 />
                 <MessageSquare className="h-4 w-4 text-gray-400" />
                 <span className="text-sm text-gray-700">WhatsApp notifications</span>
               </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.push_alerts}
                  onChange={() => togglePreference('push_alerts')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <Bell className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-700">Push notifications</span>
              </label>
            </div>
          </div>

          {/* Alert Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">What to Track</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.deadline_reminders}
                  onChange={() => togglePreference('deadline_reminders')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Deadline reminders (7, 3, 1 day before)</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.status_updates}
                  onChange={() => togglePreference('status_updates')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Contract status changes</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.document_updates}
                  onChange={() => togglePreference('document_updates')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">New document uploads</span>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Tracking Benefits:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Never miss important deadlines</li>
                  <li>• Stay updated on contract changes</li>
                  <li>• Get notified of new opportunities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Setting up...' : 'Start Tracking'}
          </button>
        </div>
      </div>
    </div>
  );
}
