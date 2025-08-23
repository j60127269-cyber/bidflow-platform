'use client'

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Loader2, Download } from 'lucide-react';
import Link from 'next/link';
import Papa from 'papaparse';

interface ContractRow {
  reference_number: string;
  title: string;
  short_description?: string;
  category: string;
  procurement_method: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  currency: string;
  bid_fee?: number;
  bid_security_amount?: number;
  bid_security_type?: string;
  margin_of_preference: boolean;
  competition_level: 'low' | 'medium' | 'high' | 'very_high';
  publish_date?: string;
  pre_bid_meeting_date?: string;
  site_visit_date?: string;
  submission_deadline: string;
  bid_opening_date?: string;
  procuring_entity: string;
  contact_person?: string;
  contact_position?: string;
  evaluation_methodology?: string;
  requires_registration: boolean;
  requires_trading_license: boolean;
  requires_tax_clearance: boolean;
  requires_nssf_clearance: boolean;
  requires_manufacturer_auth: boolean;
  submission_method?: string;
  submission_format?: string;
  required_documents?: string[];
  required_forms?: string[];
  status: string;
  current_stage: string;
  award_information?: string;
  publish_status?: 'draft' | 'published' | 'archived';
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export default function ImportContracts() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ContractRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValid, setIsValid] = useState(false);
  const [importing, setImporting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('import_contracts_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setParsedData(parsed.data || []);
        setValidationErrors(parsed.errors || []);
        setIsValid(parsed.isValid || false);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Error loading saved import data:', error);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (parsedData.length > 0) {
      const dataToSave = {
        data: parsedData,
        errors: validationErrors,
        isValid,
        timestamp: Date.now()
      };
      localStorage.setItem('import_contracts_data', JSON.stringify(dataToSave));
    }
  }, [parsedData, validationErrors, isValid]);

  // Clear localStorage when import is successful
  const clearSavedData = () => {
    localStorage.removeItem('import_contracts_data');
    setHasUnsavedChanges(false);
  };

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      parseCSV(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  }, []);

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const contracts = results.data as ContractRow[];
        setParsedData(contracts);
        setHasUnsavedChanges(true);
        validateData(contracts);
      },
      error: (error: any) => {
        console.error('CSV parsing error:', error);
        alert('Error parsing CSV file. Please check the file format.');
      }
    });
  };

  const validateData = (contracts: ContractRow[]) => {
    const errors: ValidationError[] = [];
    
    contracts.forEach((contract, index) => {
      const rowNumber = index + 2; // +2 because of 0-based index and header row
      
      // Required fields validation
      if (!contract.reference_number?.trim()) {
        errors.push({ row: rowNumber, field: 'reference_number', message: 'Reference number is required' });
      }
      
      if (!contract.title?.trim()) {
        errors.push({ row: rowNumber, field: 'title', message: 'Title is required' });
      }
      
      if (!contract.category?.trim()) {
        errors.push({ row: rowNumber, field: 'category', message: 'Category is required' });
      }
      
      if (!contract.procurement_method?.trim()) {
        errors.push({ row: rowNumber, field: 'procurement_method', message: 'Procurement method is required' });
      }
      
      if (!contract.submission_deadline?.trim()) {
        errors.push({ row: rowNumber, field: 'submission_deadline', message: 'Submission deadline is required' });
      }
      
      if (!contract.procuring_entity?.trim()) {
        errors.push({ row: rowNumber, field: 'procuring_entity', message: 'Procuring entity is required' });
      }
    });
    
    setValidationErrors(errors);
    setIsValid(errors.length === 0);
  };

  const handleImport = async () => {
    if (!isValid || parsedData.length === 0) {
      alert('Please fix validation errors before importing');
      return;
    }

    setImporting(true);
    
    try {
      const response = await fetch('/api/contracts/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contracts: parsedData }),
      });

      const result = await response.json();
      
      if (response.ok) {
        setImportResults(result);
        if (result.success > 0) {
          clearSavedData();
          alert(`Successfully imported ${result.success} contracts!`);
          router.push('/admin/contracts');
        }
      } else {
        alert(`Import failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('Import failed. Please try again.');
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        reference_number: 'URSB/SUPLS/2025-2026/00011',
        title: 'Laptops & Accessories',
        short_description: 'Supply of laptops and accessories',
        category: 'supplies',
        procurement_method: 'open domestic bidding',
        estimated_value_min: '668000000',
        estimated_value_max: '1000000000',
        currency: 'UGX',
        bid_fee: '100000',
        bid_security_amount: '13760000',
        bid_security_type: 'bank guarantee',
        margin_of_preference: 'false',
        competition_level: 'medium',
        publish_date: '2025-08-01',
        submission_deadline: '2025-08-28',
        procuring_entity: 'Uganda Registration Services Bureau',
        contact_person: 'MUSTAPHER NTALE',
        contact_position: 'ACCOUNTING OFFICER',
        evaluation_methodology: 'Within 20 working days from bid closing date',
        requires_registration: 'true',
        requires_trading_license: 'true',
        requires_tax_clearance: 'true',
        requires_nssf_clearance: 'true',
        requires_manufacturer_auth: 'false',
        submission_method: 'online',
        submission_format: 'electronic submission',
        required_documents: 'Registration/Incorporation,Trading License,Tax Clearance Certificate,NSSF Clearance',
        required_forms: 'Bid Submission Sheet,Price Schedule,Code of Ethical Conduct',
        status: 'open',
        current_stage: 'published'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contract_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    if (hasUnsavedChanges) {
                      if (confirm('You have unsaved import data. Are you sure you want to leave? This will clear your imported data.')) {
                        clearSavedData();
                        router.push('/admin/contracts');
                      }
                    } else {
                      router.push('/admin/contracts');
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Import Contracts</h1>
                  {hasUnsavedChanges && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠️ You have unsaved import data
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* File Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label htmlFor="csv-file" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Upload CSV file
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      CSV files only
                    </span>
                  </label>
                  <input
                    id="csv-file"
                    name="csv-file"
                    type="file"
                    accept=".csv"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </div>
              </div>
            </div>

            {/* Template Download */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-blue-900">Need a template?</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Download our CSV template to see the required format and column names.
                  </p>
                </div>
                <div className="flex space-x-2">
                  {hasUnsavedChanges && (
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear the imported data?')) {
                          clearSavedData();
                          setParsedData([]);
                          setValidationErrors([]);
                          setIsValid(false);
                        }
                      }}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                    >
                      Clear Data
                    </button>
                  )}
                  <button
                    onClick={downloadTemplate}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </button>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Validation Errors ({validationErrors.length})
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {validationErrors.slice(0, 10).map((error, index) => (
                          <li key={index}>
                            Row {error.row}, {error.field}: {error.message}
                          </li>
                        ))}
                        {validationErrors.length > 10 && (
                          <li>... and {validationErrors.length - 10} more errors</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Section */}
            {parsedData.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Preview ({parsedData.length} contracts)
                  </h2>
                  <div className="flex items-center space-x-2">
                    {isValid ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {isValid ? 'Ready to import' : 'Please fix errors'}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reference
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Entity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {parsedData.slice(0, 10).map((contract, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.reference_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.procuring_entity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contract.submission_deadline}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      Showing first 10 contracts. Total: {parsedData.length}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (confirm('You have unsaved import data. Are you sure you want to leave? This will clear your imported data.')) {
                      clearSavedData();
                      router.push('/admin/contracts');
                    }
                  } else {
                    router.push('/admin/contracts');
                  }
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!isValid || importing || parsedData.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import Contracts
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
