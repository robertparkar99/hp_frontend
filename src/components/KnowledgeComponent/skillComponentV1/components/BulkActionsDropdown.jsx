import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BulkActionsDropdown = ({ selectedSkills, onBulkAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  const bulkActions = [
    { id: 'assign', label: 'Assign to Employees', icon: 'Users' },
    { id: 'export', label: 'Export Selected', icon: 'Download' },
    { id: 'duplicate', label: 'Duplicate Skills', icon: 'Copy' },
    { id: 'archive', label: 'Archive Skills', icon: 'Archive' },
    { id: 'delete', label: 'Delete Skills', icon: 'Trash2', destructive: true }
  ];

  const handleActionClick = (actionId) => {
    onBulkAction(actionId, selectedSkills);
    setIsOpen(false);
  };

  if (selectedSkills.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        iconName="ChevronDown"
        iconPosition="right"
      >
        Bulk Actions ({selectedSkills.length})
      </Button>

      {isOpen && (
        <>
          <div className="absolute top-12 left-0 w-56 bg-popover border border-border rounded-md shadow-modal z-400">
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border mb-2">
                Actions for {selectedSkills.length} skills
              </div>
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleActionClick(action.id)}
                  className={`w-full flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-smooth text-left ${
                    action.destructive
                      ? 'text-destructive hover:bg-destructive/10' :'text-popover-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={action.icon} size={16} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div
            className="fixed inset-0 z-300"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
};

export default BulkActionsDropdown;