import React, { useState } from 'react';
import Button from '../../../../components/ui/Select';
import Select from '../../../../components/ui/Select';
import Icon from '../../../../components/AppIcon';

const AuditTrail = () => {
  const [auditLogs] = useState([
    {
      id: 1,
      action: 'Organization name updated',
      details: 'Changed from "ACME Inc" to "Acme Corporation"',
      user: 'John Smith',
      role: 'System Administrator',
      timestamp: '2025-01-15 14:30:25',
      ipAddress: '192.168.1.100',
      severity: 'medium'
    },
    {
      id: 2,
      action: 'Department added',
      details: 'Added new department: "Research & Development"',
      user: 'Emily Rodriguez',
      role: 'HR Manager',
      timestamp: '2025-01-15 11:15:42',
      ipAddress: '192.168.1.105',
      severity: 'low'
    },
    {
      id: 3,
      action: 'System configuration changed',
      details: 'Modified skill assessment frequency from monthly to quarterly',
      user: 'Michael Chen',
      role: 'System Administrator',
      timestamp: '2025-01-14 16:45:18',
      ipAddress: '192.168.1.102',
      severity: 'high'
    },
    {
      id: 4,
      action: 'Employee count updated',
      details: 'Updated organization size from 1000-5000 to 5000+',
      user: 'Sarah Johnson',
      role: 'HR Manager',
      timestamp: '2025-01-14 09:22:33',
      ipAddress: '192.168.1.108',
      severity: 'medium'
    },
    {
      id: 5,
      action: 'Logo updated',
      details: 'Organization logo replaced with new version',
      user: 'David Wilson',
      role: 'Marketing Manager',
      timestamp: '2025-01-13 13:18:07',
      ipAddress: '192.168.1.110',
      severity: 'low'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');

  const filterOptions = [
    { value: 'all', label: 'All Activities' },
    { value: 'high', label: 'High Severity' },
    { value: 'medium', label: 'Medium Severity' },
    { value: 'low', label: 'Low Severity' }
  ];

  const sortOptions = [
    { value: 'timestamp', label: 'Most Recent' },
    { value: 'user', label: 'By User' },
    { value: 'severity', label: 'By Severity' }
  ];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return 'AlertTriangle';
      case 'medium': return 'AlertCircle';
      case 'low': return 'Info';
      default: return 'Info';
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    filter === 'all' || log.severity === filter
  );

  const handleExport = () => {
    // Handle export functionality
    console.log('Exporting audit logs...');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Audit Trail</h3>
        <div className="flex items-center space-x-3">
          <Select
            value={filter}
            onChange={setFilter}
            options={filterOptions}
            placeholder="Filter by severity"
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            placeholder="Sort by"
          />
          <Button variant="outline" size="sm" onClick={handleExport} iconName="Download">
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log) => (
          <div key={log.id} className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-micro">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <Icon 
                    name={getSeverityIcon(log.severity)} 
                    size={16} 
                    className={`${log.severity === 'high' ? 'text-red-600' : 
                              log.severity === 'medium'? 'text-yellow-600' : 'text-green-600'}`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-foreground">{log.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                      {log.severity}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="User" size={12} />
                      <span>{log.user} ({log.role})</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={12} />
                      <span>{log.timestamp}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Globe" size={12} />
                      <span>{log.ipAddress}</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
            </div>
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No audit logs found for the selected filter.</p>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;