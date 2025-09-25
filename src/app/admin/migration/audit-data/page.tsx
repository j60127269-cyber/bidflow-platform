'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database, FileText, Building, Users, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataAudit {
  contracts: {
    total: number;
    withAwardedCompanyId: number;
    withAwardedTo: number;
    withProcuringEntityId: number;
    withProcuringEntity: number;
    uniqueAgencies: string[];
    uniqueAwardees: string[];
  };
  awardees: {
    total: number;
    active: number;
    inactive: number;
  };
  procuringEntities: {
    total: number;
    active: number;
    inactive: number;
  };
}

export default function DataAuditPage() {
  const [audit, setAudit] = useState<DataAudit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    auditData();
  }, []);

  const auditData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch contracts data
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*');

      if (contractsError) throw contractsError;

      // Fetch awardees data
      const { data: awardees, error: awardeesError } = await supabase
        .from('awardees')
        .select('*');

      if (awardeesError) throw awardeesError;

      // Fetch procuring entities data
      const { data: procuringEntities, error: procuringEntitiesError } = await supabase
        .from('procuring_entities')
        .select('*');

      if (procuringEntitiesError) throw procuringEntitiesError;

      // Analyze contracts
      const contractsWithAwardedCompanyId = contracts?.filter(c => c.awarded_company_id) || [];
      const contractsWithAwardedTo = contracts?.filter(c => c.awarded_to) || [];
      const contractsWithProcuringEntityId = contracts?.filter(c => c.procuring_entity_id) || [];
      const contractsWithProcuringEntity = contracts?.filter(c => c.procuring_entity) || [];

      // Get unique agencies and awardees
      const uniqueAgencies = [...new Set(contracts?.map(c => c.procuring_entity).filter(Boolean))] || [];
      const uniqueAwardees = [...new Set(contracts?.map(c => c.awarded_to).filter(Boolean))] || [];

      // Analyze awardees
      const activeAwardees = awardees?.filter(a => a.is_active) || [];
      const inactiveAwardees = awardees?.filter(a => !a.is_active) || [];

      // Analyze procuring entities
      const activeProcuringEntities = procuringEntities?.filter(p => p.is_active) || [];
      const inactiveProcuringEntities = procuringEntities?.filter(p => !p.is_active) || [];

      setAudit({
        contracts: {
          total: contracts?.length || 0,
          withAwardedCompanyId: contractsWithAwardedCompanyId.length,
          withAwardedTo: contractsWithAwardedTo.length,
          withProcuringEntityId: contractsWithProcuringEntityId.length,
          withProcuringEntity: contractsWithProcuringEntity.length,
          uniqueAgencies: uniqueAgencies,
          uniqueAwardees: uniqueAwardees
        },
        awardees: {
          total: awardees?.length || 0,
          active: activeAwardees.length,
          inactive: inactiveAwardees.length
        },
        procuringEntities: {
          total: procuringEntities?.length || 0,
          active: activeProcuringEntities.length,
          inactive: inactiveProcuringEntities.length
        }
      });

    } catch (error) {
      console.error('Error auditing data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Auditing data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <h3 className="text-lg font-medium text-red-800">Error</h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!audit) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Data Audit Report</h1>
          <p className="text-gray-600 mt-2">Current state of contracts, awardees, and procuring entities</p>
        </div>

        {/* Contracts Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Contracts Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{audit.contracts.total}</div>
              <div className="text-sm text-blue-800">Total Contracts</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{audit.contracts.withAwardedCompanyId}</div>
              <div className="text-sm text-green-800">With Awarded Company ID</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">{audit.contracts.withProcuringEntityId}</div>
              <div className="text-sm text-yellow-800">With Procuring Entity ID</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Awardee Relationships</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Foreign Key (awarded_company_id):</span>
                  <span className="text-sm font-medium">{audit.contracts.withAwardedCompanyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Text Field (awarded_to):</span>
                  <span className="text-sm font-medium">{audit.contracts.withAwardedTo}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Agency Relationships</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Foreign Key (procuring_entity_id):</span>
                  <span className="text-sm font-medium">{audit.contracts.withProcuringEntityId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Text Field (procuring_entity):</span>
                  <span className="text-sm font-medium">{audit.contracts.withProcuringEntity}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Unique Agencies in Contracts</h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              <div className="text-sm text-gray-600">
                {audit.contracts.uniqueAgencies.length > 0 ? (
                  audit.contracts.uniqueAgencies.map((agency, index) => (
                    <div key={index} className="py-1">{agency}</div>
                  ))
                ) : (
                  <span className="text-gray-500">No agencies found</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Awardees Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Awardees Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{audit.awardees.total}</div>
              <div className="text-sm text-green-800">Total Awardees</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{audit.awardees.active}</div>
              <div className="text-sm text-blue-800">Active</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{audit.awardees.inactive}</div>
              <div className="text-sm text-gray-800">Inactive</div>
            </div>
          </div>
        </div>

        {/* Procuring Entities Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <Building className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Procuring Entities Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{audit.procuringEntities.total}</div>
              <div className="text-sm text-purple-800">Total Entities</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{audit.procuringEntities.active}</div>
              <div className="text-sm text-blue-800">Active</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-600">{audit.procuringEntities.inactive}</div>
              <div className="text-sm text-gray-800">Inactive</div>
            </div>
          </div>
        </div>

        {/* Migration Recommendations */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Migration Recommendations</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-medium text-yellow-800 mb-2">Priority 1: Populate Procuring Entities</h3>
              <p className="text-sm text-yellow-700">
                {audit.procuringEntities.total === 0 
                  ? "No procuring entities found. Need to create them from contract data."
                  : `Only ${audit.procuringEntities.total} procuring entities found. Need to populate more from contract data.`
                }
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">Priority 2: Update Contract Foreign Keys</h3>
              <p className="text-sm text-blue-700">
                {audit.contracts.withProcuringEntityId === 0 
                  ? "No contracts have procuring_entity_id. Need to update all contracts."
                  : `Only ${audit.contracts.withProcuringEntityId} contracts have procuring_entity_id. Need to update ${audit.contracts.total - audit.contracts.withProcuringEntityId} more contracts.`
                }
              </p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-800 mb-2">Priority 3: Update APIs</h3>
              <p className="text-sm text-green-700">
                Update all APIs to use foreign key relationships instead of text matching for better performance and reliability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
