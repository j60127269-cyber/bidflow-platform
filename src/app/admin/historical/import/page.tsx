'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export default function HistoricalImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [fiscalYear, setFiscalYear] = useState('2024-2025');
  const [targetEntity, setTargetEntity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setIsLoading(true);

    try {
      const data = await readFile(uploadedFile);
      console.log('Raw data:', data);
      
      // Transform MOWT data to our expected format
      const transformedData = transformMowtData(data);
      console.log('Transformed data:', transformedData);
      
      setPreview(transformedData.slice(0, 5)); // Show first 5 rows
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Error reading file. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const readFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };

  const transformMowtData = (data: any[]): any[] => {
    console.log('Transforming data with target entity:', targetEntity);
    console.log('Sample raw row:', data[0]);
    console.log('Sample raw row keys:', Object.keys(data[0]));
    
    const transformed = data.map((row, index) => {
      // Map MOWT column names to our expected format
      const transformedRow = {
        provider: row['Provider'] || '',
        female_owned: row['Female Owned'] || 'No',
        entity: targetEntity || row['Entity'] || '', // Use target entity if specified
        proc_reference_no: row['Proc Reference No'] || '',
        subject_of_procurement: row['Subject of Procurement'] || '',
        contract_award_date: row['Contract Award Date'] || '',
        contract_amt_ugx: row['Contract Amt (UGX)'] || '',
        status: row['Status'] || 'Awarded'
      };
      
      if (index === 0) {
        console.log('Sample transformed row:', transformedRow);
        console.log('Sample transformed row keys:', Object.keys(transformedRow));
      }
      
      return transformedRow;
    });
    
    console.log('Transformation complete. Total rows:', transformed.length);
    return transformed;
  };

  const handleImport = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    console.log('Starting import with target entity:', targetEntity);
    console.log('Target entity type:', typeof targetEntity);
    console.log('Target entity length:', targetEntity?.length);

    setIsLoading(true);
    try {
      const data = await readFile(file);
      console.log('Current target entity before transform:', targetEntity);
      const transformedData = transformMowtData(data);

      const response = await fetch('/api/historical/import-government-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: transformedData,
          fileName: file.name,
          fiscalYear: fiscalYear
        }),
      });

      const result = await response.json();
      setResult(result);
      
      console.log('Import result:', result);
      
      if (result.success) {
        alert(`Successfully imported ${result.data.successfulImports} records!`);
      } else {
        console.log('Import errors:', result.data.errors);
        console.log('First 10 errors:', result.data.errors.slice(0, 10));
        alert(`Import completed with errors. ${result.data.successfulImports} successful, ${result.data.failedImports} failed. Check console for details.`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Error during import. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Historical Data Import</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload MOWT Excel File</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Excel File (.xlsx, .xls)
              </label>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fiscal Year
              </label>
              <select
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2023-2024">2023-2024</option>
                <option value="2022-2023">2022-2023</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Entity (Optional)
              </label>
              <input
                type="text"
                value={targetEntity}
                onChange={(e) => {
                  console.log('Setting target entity to:', e.target.value);
                  setTargetEntity(e.target.value);
                }}
                placeholder="e.g., Ministry of Works and Transport"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                If specified, all contracts will be assigned to this entity. Leave empty to use entity names from the Excel file.
              </p>
              <p className="mt-1 text-sm text-blue-600">
                Current target entity: "{targetEntity || 'None'}"
              </p>
            </div>

            {preview.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Data Preview (First 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                                         <thead className="bg-gray-50">
                       <tr>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Female Owned</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Entity {targetEntity && <span className="text-blue-600">(Target: {targetEntity})</span>}
                         </th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                       </tr>
                     </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {preview.map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.provider}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.female_owned}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.entity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.proc_reference_no}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">{row.subject_of_procurement}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.contract_award_date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.contract_amt_ugx}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              onClick={handleImport}
              disabled={!file || isLoading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Importing...' : 'Import Data'}
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Import Result</h2>
            <div className="space-y-2">
              <p><strong>Success:</strong> {result.success ? 'Yes' : 'No'}</p>
              <p><strong>Total Records:</strong> {result.data?.totalRecords}</p>
              <p><strong>Successful Imports:</strong> {result.data?.successfulImports}</p>
              <p><strong>Failed Imports:</strong> {result.data?.failedImports}</p>
              {result.data?.errors && result.data.errors.length > 0 && (
                <div>
                  <p><strong>Errors:</strong></p>
                  <ul className="list-disc list-inside text-sm text-red-600 max-h-40 overflow-y-auto">
                    {result.data.errors.slice(0, 10).map((error: string, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                    {result.data.errors.length > 10 && (
                      <li>... and {result.data.errors.length - 10} more errors</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
