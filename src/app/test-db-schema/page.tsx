'use client'

import { useState } from 'react'

export default function TestDBSchema() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testSchema = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db-schema')
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ error: 'Failed to test schema', details: error })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Schema Test</h1>
          
          <button
            onClick={testSchema}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Database Schema'}
          </button>

          {result && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Results:</h2>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
