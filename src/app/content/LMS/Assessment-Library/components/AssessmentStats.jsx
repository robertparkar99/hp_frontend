  import React from 'react';
  import Icon from '../../../../../components/AppIcon';

  const AssessmentStats = ({ stats }) => {
    const statItems = [
      {
        label: 'Total Assessments',
        value: stats.total,
        icon: 'ClipboardCheck',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        label: 'Active',
        value: stats.notAttempted,
        icon: 'Circle',
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      },
      {
        label: 'Inactive',
        value: stats.inProgress,
        icon: 'Clock',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      },
      {
        label: 'Recent',
        value: stats.completed,
        icon: 'CheckCircle',
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        label: 'Upcoming',
        value: stats.failed,
        icon: 'XCircle',
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      },
      // {
      //   label: 'Urgent Deadlines',
      //   value: stats.urgent,
      //   icon: 'AlertTriangle',
      //   color: 'text-orange-600',
      //   bgColor: 'bg-orange-100'
      // }
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statItems.map((item, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 ${item.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={item.icon} size={20} className={item.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  export default AssessmentStats;