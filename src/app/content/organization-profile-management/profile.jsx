import React, { useState, useEffect } from 'react';
import OrganizationInfoForm from './components/OrganizationInfoForm';
import DepartmentStructure from './components/DepartmentStructure';
import SystemConfiguration from './components/SystemConfiguration';
import AuditTrail from './components/AuditTrail';
import DisciplinaryManagement from './components/DisciplinaryManagement';
import OrganizationProfileTour from './components/OrganizationProfileTour';

const OrganizationProfileManagement = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // Check if tour should start (only when navigated from sidebar tour)
  useEffect(() => {
    const triggerTour = sessionStorage.getItem('triggerPageTour');
    console.log('[Profile] triggerPageTour value:', triggerTour);

    if (triggerTour === 'organization-profile') {
      console.log('[Profile] Starting page tour automatically');
      setShowTour(true);
      // Clean up the flag
      sessionStorage.removeItem('triggerPageTour');
    }
  }, []);

  // Listen for tab switch events from tour
  useEffect(() => {
    const handleSwitchTab = (event) => {
      const targetTab = event.detail;
      if (targetTab && targetTab !== activeTab) {
        setActiveTab(targetTab);
      }
    };

    window.addEventListener('orgProfileTourSwitchTab', handleSwitchTab);
    return () => window.removeEventListener('orgProfileTourSwitchTab', handleSwitchTab);
  }, [activeTab]);

  const handleSwitchTab = (tabId) => {
    setActiveTab(tabId);
  };

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

  const handleTourComplete = () => {
    setShowTour(false);
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
    <div className="min-h-screen bg-background rounded-xl">
      <div>
        <main className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4" id="org-profile-header">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Organization Profile Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your organization's information, Department structure.
              </p>
            </div>
            {/* No manual Take Tour button - tour only starts via sidebar navigation */}
          </div>

          {/* Tab Navigation */}
          <div className="bg-card border border-border rounded-lg mb-6">
            <div className="flex space-x-0 border-b border-border">
              {tabs.map((tab, index) => {
                let tabId = '';
                if (tab.id === 'info') tabId = 'tab-info';
                else if (tab.id === 'structure') tabId = 'tab-structure';
                else if (tab.id === 'config') tabId = 'tab-config';
                else if (tab.id === 'disciplinary') tabId = 'tab-disciplinary';

                return (
                  <button
                    key={tab.id}
                    id={tabId}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-micro border-b-2 ${activeTab === tab.id
                      ? 'border-blue-400 text-blue-400 bg-primary/5' : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    <span className="text-base">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Tour Component */}
      {showTour && (
        <OrganizationProfileTour
          onComplete={handleTourComplete}
          onSwitchTab={handleSwitchTab}
        />
      )}
    </div>
  );
};

export default OrganizationProfileManagement;
