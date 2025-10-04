import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, MetricCard, StatusBadge } from '@/components/ui';

interface Contract {
  id: string;
  title: string;
  deadline: string;
  value: string;
  matchScore: number;
  status: 'high' | 'medium' | 'low';
}

interface ContractSearchProps {
  onSearch?: (query: string) => void;
  contracts?: Contract[];
}

export const ContractSearch: React.FC<ContractSearchProps> = ({
  onSearch,
  contracts = [],
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Search Results */}
        <div className="space-y-4">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-medium text-slate-800 mb-1">
                  {contract.title}
                </h3>
                <div className="text-sm text-slate-600">
                  Deadline: {contract.deadline} • Value: {contract.value}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge status={getMatchColor(contract.matchScore)}>
                  {contract.matchScore}% Match
                </StatusBadge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Search Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Results"
          value={contracts.length}
          subtitle="Contracts found"
        />
        <MetricCard
          title="High Matches"
          value={contracts.filter(c => c.matchScore >= 80).length}
          subtitle="80%+ match score"
        />
        <MetricCard
          title="Avg Match"
          value={`${Math.round(contracts.reduce((acc, c) => acc + c.matchScore, 0) / contracts.length || 0)}%`}
          subtitle="Average match score"
        />
      </div>
    </div>
  );
};

export default ContractSearch;
