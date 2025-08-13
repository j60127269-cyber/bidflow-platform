"use client";

import { useState } from 'react';

export default function TestEnvPage() {
  const [envStatus, setEnvStatus] = useState<string>('');

  const checkEnvironmentVariables = async () => {
    setEnvStatus('Checking environment variables...');
    
    try {
      const response = await fetch('/api/test-env');
      const data = await response.json();
      
      if (response.ok) {
        setEnvStatus(`✅ Environment Variables Status:\n\n${JSON.stringify(data, null, 2)}`);
      } else {
        setEnvStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setEnvStatus(`❌ Error: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔧 Environment Variables Test
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Check Environment Variables
              </h2>
              <p className="text-blue-800 mb-4">
                This will verify that all your environment variables are loaded correctly.
              </p>
              <button
                onClick={checkEnvironmentVariables}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                🔍 Check Environment Variables
              </button>
            </div>

            {envStatus && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Environment Status
                </h3>
                <pre className="text-gray-800 whitespace-pre-wrap text-sm bg-white p-4 rounded border">
                  {envStatus}
                </pre>
              </div>
            )}

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                ✅ What Should Be Working
              </h2>
              <ul className="text-green-800 space-y-1">
                <li>• Resend API Key - Email notifications</li>
                <li>• Twilio Account SID - WhatsApp service</li>
                <li>• Twilio Auth Token - WhatsApp authentication</li>
                <li>• Supabase credentials (if added)</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                🧪 Next Steps
              </h2>
              <ol className="text-yellow-800 space-y-1">
                <li>1. Click "Check Environment Variables" above</li>
                <li>2. Verify all variables are loaded</li>
                <li>3. Go to <a href="/test-notifications" className="text-blue-600 underline">/test-notifications</a> to test actual notifications</li>
                <li>4. Test email and WhatsApp sending</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
