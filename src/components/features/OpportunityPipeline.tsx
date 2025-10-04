import React from 'react';
import { Card, StatusBadge } from '@/components/ui';
import { Users, Calendar, ArrowRight } from 'lucide-react';

interface Opportunity {
  id: string;
  title: string;
  deadline: string;
  teamSize: number;
  stage: 'identified' | 'in-progress' | 'submitted' | 'won';
  value: string;
}

interface OpportunityPipelineProps {
  opportunities: Opportunity[];
  onStageChange?: (id: string, newStage: string) => void;
}

export const OpportunityPipeline: React.FC<OpportunityPipelineProps> = ({
  opportunities,
  onStageChange,
}) => {
  const stages = [
    { key: 'identified', label: 'Identified', color: 'blue' },
    { key: 'in-progress', label: 'In Progress', color: 'yellow' },
    { key: 'submitted', label: 'Submitted', color: 'orange' },
    { key: 'won', label: 'Won', color: 'green' },
  ];

  const getStageCount = (stage: string) => {
    return opportunities.filter(opp => opp.stage === stage).length;
  };

  const getStageColor = (stage: string) => {
    const stageConfig = stages.find(s => s.key === stage);
    return stageConfig?.color || 'gray';
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Opportunity Pipeline</h2>
        <div className="flex space-x-2">
          {stages.map((stage) => (
            <div
              key={stage.key}
              className={`px-3 py-1 rounded-full text-sm font-medium bg-${stage.color}-100 text-${stage.color}-800`}
            >
              {getStageCount(stage.key)} {stage.label}
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <div key={stage.key} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-800">{stage.label}</h3>
              <span className="text-sm text-slate-600">
                {getStageCount(stage.key)}
              </span>
            </div>
            
            <div className="space-y-2">
              {opportunities
                .filter(opp => opp.stage === stage.key)
                .map((opportunity) => (
                  <Card
                    key={opportunity.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => onStageChange?.(opportunity.id, stage.key)}
                  >
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-800 text-sm">
                        {opportunity.title}
                      </h4>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{opportunity.deadline}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{opportunity.teamSize}</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-700">
                        {opportunity.value}
                      </div>
                      <div className="flex items-center justify-between">
                        <StatusBadge
                          status={stage.key === 'won' ? 'success' : 'info'}
                          size="sm"
                        >
                          {stage.label}
                        </StatusBadge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpportunityPipeline;
