import React, { useState } from 'react';
//import GlobalHeader from '../../components/ui/GlobalHeader';
//import PrimarySidebar from '../../components/ui/PrimarySidebar';
//import BreadcrumbNavigation from '../../components/ui/BreadcrumbNavigation';
import Button from '../../../components/skill/Button';
//import { Button } from '@/components/ui/button';
import OrganizationInfoForm from './components/OrganizationInfoForm';
import DepartmentStructure from './components/DepartmentStructure';
import SystemConfiguration from './components/SystemConfiguration';
import AuditTrail from './components/AuditTrail';

const OrganizationProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: 'info', label: 'Organization Info', icon: 'Building2' },
    { id: 'structure', label: 'Department Structure', icon: 'Users' },
    // { id: 'config', label: 'System Configuration', icon: 'Settings' },
    // { id: 'audit', label: 'Audit Trail', icon: 'FileText' }
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
      default:
        return <OrganizationInfoForm onSave={handleSave} loading={loading} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <GlobalHeader />
      <PrimarySidebar /> */}
      
      <div>
        {/* <BreadcrumbNavigation /> */}
        
        <main className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Organization Profile Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage your organization's information, structure, and hierarchy
              </p>
            </div>
            <Button variant="outline" iconName="HelpCircle">
              Help
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="flex space-x-0 border-b border-border">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-micro border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <span className="text-base">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default OrganizationProfileManagement;