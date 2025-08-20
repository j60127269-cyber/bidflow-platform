'use client'

import { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Settings } from 'lucide-react';

export default function AdminSetupTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testSetup = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/test-setup');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Test error:', error);
      setResult({
        error: 'Failed to connect to test endpoint',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Setup Test
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Test your admin setup configuration
          </p>
        </div>

        <div className="space-y-6">
          <button
            onClick={testSetup}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </div>
            ) : (
              "Test Configuration"
            )}
          </button>

          {result && (
            <div className={`rounded-lg p-4 ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.success ? 'Configuration OK' : 'Configuration Error'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message || result.error}
                  </p>
                  {result.details && (
                    <p className="text-xs mt-2 text-gray-600">
                      Details: {result.details}
                    </p>
                  )}
                  {result.status && (
                    <p className="text-xs mt-1 text-gray-500">
                      Status: {result.status}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Troubleshooting Steps</h3>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• Check your environment variables</li>
                  <li>• Ensure SUPABASE_SERVICE_ROLE_KEY is set</li>
                  <li>• Verify your Supabase project settings</li>
                  <li>• Run the SQL script in Supabase SQL Editor</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
