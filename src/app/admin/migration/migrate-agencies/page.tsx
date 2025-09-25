'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database, Building, CheckCircle, AlertTriangle, Loader } from 'lucide-react';

interface MigrationStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  data?: any;
}

export default function MigrateAgenciesPage() {
  const [steps, setSteps] = useState<MigrationStep[]>([
    { id: 'extract', name: 'Extract Unique Agencies from Contracts', status: 'pending' },
    { id: 'clean', name: 'Clean and Standardize Agency Names', status: 'pending' },
    { id: 'create', name: 'Create Procuring Entities', status: 'pending' },
    { id: 'update', name: 'Update Contracts with Foreign Keys', status: 'pending' },
    { id: 'verify', name: 'Verify Migration Results', status: 'pending' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [results, setResults] = useState<any>(null);

  const updateStep = (stepId: string, status: MigrationStep['status'], message?: string, data?: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, data }
        : step
    ));
  };

  const runMigration = async () => {
    setLoading(true);
    setCurrentStep('extract');
    
    try {
      // Step 1: Extract unique agencies from contracts
      updateStep('extract', 'running', 'Fetching contracts...');
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('procuring_entity')
        .not('procuring_entity', 'is', null);

      if (contractsError) throw contractsError;

      const uniqueAgencies = [...new Set(contracts?.map(c => c.procuring_entity).filter(Boolean))] || [];
      updateStep('extract', 'completed', `Found ${uniqueAgencies.length} unique agencies`, uniqueAgencies);

      // Step 2: Clean and standardize agency names
      setCurrentStep('clean');
      updateStep('clean', 'running', 'Cleaning agency names...');
      
      const cleanedAgencies = uniqueAgencies.map(agency => ({
        original: agency,
        cleaned: agency.trim().replace(/\s+/g, ' '),
        entity_type: determineEntityType(agency),
        is_active: true,
        data_source: 'migration',
        source_file: 'contracts_extraction'
      }));

      updateStep('clean', 'completed', `Cleaned ${cleanedAgencies.length} agency names`, cleanedAgencies);

      // Step 3: Create procuring entities
      setCurrentStep('create');
      updateStep('create', 'running', 'Creating procuring entities...');
      
      const entitiesToCreate = cleanedAgencies.map(agency => ({
        entity_name: agency.cleaned,
        entity_type: agency.entity_type,
        is_active: agency.is_active,
        data_source: agency.data_source,
        source_file: agency.source_file
      }));

      const { data: createdEntities, error: createError } = await supabase
        .from('procuring_entities')
        .insert(entitiesToCreate)
        .select();

      if (createError) throw createError;

      updateStep('create', 'completed', `Created ${createdEntities?.length || 0} procuring entities`, createdEntities);

      // Step 4: Update contracts with foreign keys
      setCurrentStep('update');
      updateStep('update', 'running', 'Updating contracts with foreign keys...');
      
      let updatedContracts = 0;
      for (const entity of createdEntities || []) {
        const { error: updateError } = await supabase
          .from('contracts')
          .update({ procuring_entity_id: entity.id })
          .eq('procuring_entity', entity.entity_name);

        if (updateError) {
          console.error(`Error updating contracts for ${entity.entity_name}:`, updateError);
        } else {
          updatedContracts++;
        }
      }

      updateStep('update', 'completed', `Updated ${updatedContracts} contracts with foreign keys`);

      // Step 5: Verify migration results
      setCurrentStep('verify');
      updateStep('verify', 'running', 'Verifying migration results...');
      
      const { data: verifyContracts, error: verifyError } = await supabase
        .from('contracts')
        .select('id, procuring_entity, procuring_entity_id')
        .not('procuring_entity', 'is', null);

      if (verifyError) throw verifyError;

      const contractsWithForeignKeys = verifyContracts?.filter(c => c.procuring_entity_id) || [];
      const contractsWithoutForeignKeys = verifyContracts?.filter(c => !c.procuring_entity_id) || [];

      updateStep('verify', 'completed', 
        `Migration complete! ${contractsWithForeignKeys.length} contracts have foreign keys, ${contractsWithoutForeignKeys.length} still need manual review`,
        { contractsWithForeignKeys, contractsWithoutForeignKeys }
      );

      setResults({
        totalAgencies: uniqueAgencies.length,
        createdEntities: createdEntities?.length || 0,
        updatedContracts: updatedContracts,
        contractsWithForeignKeys: contractsWithForeignKeys.length,
        contractsWithoutForeignKeys: contractsWithoutForeignKeys.length
      });

    } catch (error) {
      console.error('Migration error:', error);
      updateStep(currentStep || 'extract', 'error', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
      setCurrentStep(null);
    }
  };

  const determineEntityType = (agencyName: string): string => {
    const name = agencyName.toLowerCase();
    
    if (name.includes('ministry')) return 'ministry';
    if (name.includes('department')) return 'department';
    if (name.includes('agency')) return 'agency';
    if (name.includes('authority')) return 'authority';
    if (name.includes('commission')) return 'commission';
    if (name.includes('corporation')) return 'corporation';
    if (name.includes('board')) return 'board';
    if (name.includes('council')) return 'council';
    if (name.includes('office')) return 'office';
    if (name.includes('bureau')) return 'bureau';
    
    return 'government_entity';
  };

  const getStepIcon = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'running':
        return <Loader className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status: MigrationStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Migrate Agencies to Proper Structure</h1>
          <p className="text-gray-600 mt-2">Extract agencies from contracts and create proper foreign key relationships</p>
        </div>

        {/* Migration Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration Steps</h2>
          <div className="space-y-4">
            {steps.map((step) => (
              <div key={step.id} className={`border rounded-lg p-4 ${getStepColor(step.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getStepIcon(step.status)}
                    <span className="ml-3 font-medium text-gray-900">{step.name}</span>
                  </div>
                  {step.status === 'running' && (
                    <span className="text-sm text-blue-600">Running...</span>
                  )}
                </div>
                {step.message && (
                  <p className="mt-2 text-sm text-gray-600">{step.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Migration Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Start Migration</h3>
              <p className="text-sm text-gray-600">This will extract agencies from contracts and create proper relationships</p>
            </div>
            <button
              onClick={runMigration}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium"
            >
              {loading ? 'Running Migration...' : 'Start Migration'}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Migration Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{results.totalAgencies}</div>
                <div className="text-sm text-blue-800">Unique Agencies Found</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{results.createdEntities}</div>
                <div className="text-sm text-green-800">Entities Created</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{results.updatedContracts}</div>
                <div className="text-sm text-purple-800">Contracts Updated</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-600">{results.contractsWithForeignKeys}</div>
                <div className="text-sm text-yellow-800">Contracts with Foreign Keys</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
