import React, { useState } from 'react';
import Button from '@/components/ui/button';
import OrganizationInfoForm from './components/OrganizationInfoForm';
import DepartmentStructure from './components/DepartmentStructure';
import SystemConfiguration from './components/SystemConfiguration';
import AuditTrail from './components/AuditTrail';
import DisciplinaryManagement from './components/DisciplinaryManagement'
//add comment
const OrganizationProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'info', label: 'Organization Info', icon: 'Building2' },
    { id: 'structure', label: 'Department Management', icon: 'Users' },
    { id: 'config', label: 'Compliance Management', icon: 'Settings' },
    // { id: 'audit', label: 'Organization Handbook', icon: 'FileText' },
    { id: 'disciplinary', label: 'Disciplinary Management', icon: 'FileText' }
  ];

  const handleSave = async (data) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Saved data:', data);
      // Show success message
    } catch (error) {
      console.error('Error saving data:', error);
      // Show error message
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <OrganizationInfoForm onSave={handleSave} loading={loading} />;
      case 'structure':
        return <DepartmentStructure onSave={handleSave} loading={loading} />;
      case 'config':
        return <SystemConfiguration onSave={handleSave} loading={loading} />;
      case 'audit':
        return <AuditTrail />;
        case 'disciplinary':
          return <DisciplinaryManagement onSave={handleSave} loading={loading}/>
      default:
        return <OrganizationInfoForm onSave={handleSave} loading={loading} />;
    }
  };

  return (
    <div className="bg-background rounded-xl w-full h-full">
      <div className="w-full">
        <main className="p-4 md:p-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">Organization Profile Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's information, Department structure.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg mb-6 w-full overflow-x-auto scrollbar-hide">
            <div className="flex space-x-0 border-b border-border min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-micro border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-400 text-blue-400 bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="text-base">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6 w-full overflow-hidden">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizationProfileManagement;
