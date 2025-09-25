'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Trash2, Merge, Building, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface DuplicateEntity {
  id: string;
  entity_name: string;
  entity_type: string;
  website?: string;
  country: string;
  is_active: boolean;
  created_at: string;
  contract_count: number;
}

interface DuplicateGroup {
  normalizedName: string;
  entities: DuplicateEntity[];
  count: number;
  total_contracts: number;
}

interface DuplicatesData {
  duplicates: DuplicateGroup[];
  total_duplicates: number;
  total_entities: number;
}

export default function DuplicatesPage() {
  const [duplicatesData, setDuplicatesData] = useState<DuplicatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [merging, setMerging] = useState<string | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/procuring-entities/duplicates');
      if (response.ok) {
        const data = await response.json();
        setDuplicatesData(data);
      } else {
        console.error('Error fetching duplicates:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching duplicates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = async (group: DuplicateGroup) => {
    if (group.entities.length < 2) return;

    // Find the entity with the most contracts (or earliest created if tied)
    const keepEntity = group.entities.reduce((best, current) => {
      if (current.contract_count > best.contract_count) return current;
      if (current.contract_count === best.contract_count) {
        return new Date(current.created_at) < new Date(best.created_at) ? current : best;
      }
      return best;
    });

    const mergeEntityIds = group.entities
      .filter(entity => entity.id !== keepEntity.id)
      .map(entity => entity.id);

    if (mergeEntityIds.length === 0) return;

    try {
      setMerging(group.normalizedName);
      const response = await fetch('/api/procuring-entities/duplicates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mergeData: {
            keepEntityId: keepEntity.id,
            mergeEntityIds: mergeEntityIds
          }
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Merge successful:', result);
        // Refresh the duplicates list
        await fetchDuplicates();
      } else {
        const error = await response.text();
        console.error('Merge failed:', error);
        alert('Failed to merge entities: ' + error);
      }
    } catch (error) {
      console.error('Error merging entities:', error);
      alert('Error merging entities: ' + error);
    } finally {
      setMerging(null);
    }
  };

  const handleSelectGroup = (groupName: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupName)) {
      newSelected.delete(groupName);
    } else {
      newSelected.add(groupName);
    }
    setSelectedGroups(newSelected);
  };

  const handleBulkMerge = async () => {
    if (selectedGroups.size === 0) return;

    const groupsToMerge = duplicatesData?.duplicates.filter(group => 
      selectedGroups.has(group.normalizedName)
    ) || [];

    for (const group of groupsToMerge) {
      await handleMerge(group);
    }

    setSelectedGroups(new Set());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!duplicatesData) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Duplicates</h1>
            <p className="text-gray-600">Failed to load duplicate entities.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Duplicate Entities</h1>
              <p className="text-gray-600 mt-2">
                Manage duplicate procuring entities in your database
              </p>
            </div>
            <Link
              href="/admin/agencies"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Entities
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Duplicate Groups</p>
                <p className="text-2xl font-bold text-gray-900">{duplicatesData.total_duplicates}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Building className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entities</p>
                <p className="text-2xl font-bold text-gray-900">{duplicatesData.total_entities}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {duplicatesData.duplicates.reduce((sum, group) => sum + group.total_contracts, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {duplicatesData.duplicates.length > 0 && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBulkMerge}
                  disabled={selectedGroups.size === 0}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  <Merge className="h-4 w-4 mr-2" />
                  Merge Selected ({selectedGroups.size})
                </button>
                <button
                  onClick={() => setSelectedGroups(new Set())}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Clear Selection
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Select groups to merge automatically
              </p>
            </div>
          </div>
        )}

        {/* Duplicates List */}
        {duplicatesData.duplicates.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Duplicates Found</h2>
            <p className="text-gray-600">All procuring entities are unique!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {duplicatesData.duplicates.map((group, index) => (
              <div key={group.normalizedName} className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedGroups.has(group.normalizedName)}
                        onChange={() => handleSelectGroup(group.normalizedName)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {group.normalizedName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {group.count} entities • {group.total_contracts} contracts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMerge(group)}
                      disabled={merging === group.normalizedName}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {merging === group.normalizedName ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Merging...
                        </>
                      ) : (
                        <>
                          <Merge className="h-4 w-4 mr-2" />
                          Merge Group
                        </>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {group.entities.map((entity, entityIndex) => (
                      <div key={entity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Building className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{entity.entity_name}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {entity.entity_type} • {entity.country}
                              </span>
                              {entity.website && (
                                <span className="text-xs text-blue-600">{entity.website}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600">
                              <FileText className="h-4 w-4 mr-1" />
                              {entity.contract_count} contracts
                            </div>
                            <div className="text-xs text-gray-500">
                              Created: {new Date(entity.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          {entityIndex === 0 && (
                            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                              Keep (Most Contracts)
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
