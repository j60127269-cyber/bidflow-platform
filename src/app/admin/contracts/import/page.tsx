'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Download,
  X
} from 'lucide-react';

interface ContractData {
  title: string;
  client: string;
  location: string;
  value: number;
  deadline: string;
  category: string;
  description: string;
  status: string;
  posted_date: string;
  requirements?: string;
}

export default function ImportContracts() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  }>({ success: 0, errors: [] });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      alert('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data: ContractData[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          
          // Convert value to number
          if (row.value) {
            row.value = parseFloat(row.value.replace(/[^\d.]/g, '')) || 0;
          }
          
          data.push(row);
        }
      }
      
      setPreview(data.slice(0, 5)); // Show first 5 rows as preview
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setImportResults({ success: 0, errors: [] });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        let successCount = 0;
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            try {
              const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
              const row: any = {};
              
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });

              // Validate required fields
              if (!row.title || !row.client || !row.location) {
                errors.push(`Row ${i + 1}: Missing required fields (title, client, location)`);
                continue;
              }

              // Convert value to number
              const value = parseFloat(row.value?.replace(/[^\d.]/g, '')) || 0;

              // Parse requirements as array
              const requirements = row.requirements ? 
                row.requirements.split(';').map((req: string) => req.trim()).filter(Boolean) : 
                [];

              // Prepare contract data
              const contractData = {
                title: row.title,
                client: row.client,
                location: row.location,
                value: value,
                deadline: row.deadline || new Date().toISOString(),
                category: row.category || 'Other',
                description: row.description || '',
                status: row.status || 'Open',
                posted_date: row.posted_date || new Date().toISOString(),
                requirements: requirements
              };

              // Insert into database
              const { error } = await supabase
                .from('contracts')
                .insert(contractData);

              if (error) {
                errors.push(`Row ${i + 1}: ${error.message}`);
              } else {
                successCount++;
              }
            } catch (error) {
              errors.push(`Row ${i + 1}: ${error}`);
            }
          }
        }

        setImportResults({ success: successCount, errors });
        setImporting(false);
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({ success: 0, errors: ['Failed to process file'] });
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `title,client,location,value,deadline,category,description,status,posted_date,requirements
"Road Construction Project","Ministry of Works","Kampala",50000000,"2024-12-31","Construction & Engineering","Construction of major highway","Open","2024-01-15","5 years experience;Valid license;Insurance"
"IT System Upgrade","Bank of Uganda","Entebbe",25000000,"2024-11-30","Information Technology","Upgrade banking systems","Open","2024-01-10","Certified developers;Security clearance"
"Medical Equipment Supply","Mulago Hospital","Kampala",75000000,"2024-10-15","Healthcare & Medical","Supply medical equipment","Open","2024-01-05","ISO certified;Medical license"`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contracts_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B UGX`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M UGX`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K UGX`;
    }
    return `${value} UGX`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/contracts"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Contracts
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Import Contracts</h1>
            <p className="mt-1 text-sm text-gray-600">
              Bulk import contracts from CSV file
            </p>
          </div>
        </div>
      </div>

      {/* Import Results */}
      {importResults.success > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-green-800">
                Import completed successfully!
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {importResults.success} contracts imported successfully.
                {importResults.errors.length > 0 && (
                  <span className="ml-2">
                    {importResults.errors.length} errors occurred.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {importResults.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Import completed with errors
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc list-inside space-y-1">
                  {importResults.errors.slice(0, 5).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importResults.errors.length > 5 && (
                    <li>... and {importResults.errors.length - 5} more errors</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Need a template?
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Download our CSV template to see the required format
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-3 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Template
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Upload CSV File</h3>
            <p className="text-sm text-gray-600">
              Select a CSV file containing contract data
            </p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center">
              {!file ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Choose a file
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        CSV up to 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <FileText className="mx-auto h-12 w-12 text-green-400" />
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setFile(null);
                      setPreview([]);
                      setImportResults({ success: 0, errors: [] });
                    }}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Preview (first 5 rows)
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {row.title}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {row.client}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {row.location}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {formatValue(row.value)}
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-500">
                          {row.category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Button */}
          {file && (
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={importing}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Contracts
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">CSV Format Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Required Fields</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>title</strong> - Contract title</li>
              <li>• <strong>client</strong> - Client/organization name</li>
              <li>• <strong>location</strong> - Contract location</li>
              <li>• <strong>value</strong> - Contract value (numbers only)</li>
              <li>• <strong>deadline</strong> - Submission deadline (YYYY-MM-DD)</li>
              <li>• <strong>category</strong> - Contract category</li>
              <li>• <strong>description</strong> - Contract description</li>
              <li>• <strong>status</strong> - Contract status (Open/Closed/Awarded/Cancelled)</li>
              <li>• <strong>posted_date</strong> - Posted date (YYYY-MM-DD)</li>
              <li>• <strong>requirements</strong> - Requirements (semicolon-separated)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tips</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Use the template as a starting point</li>
              <li>• Ensure all required fields are filled</li>
              <li>• Use semicolons (;) to separate multiple requirements</li>
              <li>• Values should be numbers only (no currency symbols)</li>
              <li>• Dates should be in YYYY-MM-DD format</li>
              <li>• Maximum file size: 10MB</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
