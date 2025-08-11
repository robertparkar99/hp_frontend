import React, { useState } from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import Select from '../../../../../components/ui/Select';
import { Checkbox } from '../../../../../components/ui/checkbox';
import SearchFilters from '../../../../../components/searchfileds/SearchFilters';

const CreateAssessmentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    searchSection: '',
    searchStandard: '',
    subject: '',
    searchByChapter: '',
    searchByTopic: '',
    searchByMappingType: '',
    searchByMappingValue: '',
    examName: '',
    examDescription: '',
    attemptAllowed: '',
    openDate: '',
    closeDate: '',
    enableTimeLimit: true,
    allowedTime: '',
    examType: 'online',
    shuffleQuestions: true,
    showFeedback: true,
    show: true,
    showRightAnswerAfterResult: true,
    totalQuestions: '',
    totalMarks: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    console.log('Searching with filters:', formData);
    // Add your search logic here
  };

  const handleSave = () => {
    console.log('Saving Exam:', formData);
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-modal w-full max-w-5xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Exam</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)] space-y-6">
          
          {/* Search Filters */}
          <SearchFilters
            formData={formData}
            onFormChange={handleChange}
            onSearch={handleSearch}
          />

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Exam Name / Paper Name *" value={formData.examName} onChange={e => handleChange('examName', e.target.value)} />
            <Input label="Exam Description / Paper Description *" value={formData.examDescription} onChange={e => handleChange('examDescription', e.target.value)} />
            <Select label="Attempt Allowed *" value={formData.attemptAllowed} onChange={v => handleChange('attemptAllowed', v)} options={[]} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="date" label="Open Date" value={formData.openDate} onChange={e => handleChange('openDate', e.target.value)} />
            <Input type="date" label="Close Date" value={formData.closeDate} onChange={e => handleChange('closeDate', e.target.value)} />
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.enableTimeLimit}
                onCheckedChange={(checked) => handleChange('enableTimeLimit', checked)}
              />
              <span>Enable Time Limit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input type="number" label="Allowed Time (mins) *" value={formData.allowedTime} onChange={e => handleChange('allowedTime', e.target.value)} />
            <div>
              <label className="block mb-1">Exam Type</label>
              <div className="flex items-center space-x-4">
                <label>
                  <input type="radio" checked={formData.examType === 'online'} onChange={() => handleChange('examType', 'online')} /> Online
                </label>
                <label>
                  <input type="radio" checked={formData.examType === 'offline'} onChange={() => handleChange('examType', 'offline')} /> Offline
                </label>
              </div>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.shuffleQuestions}
                onCheckedChange={(checked) => handleChange('shuffleQuestions', checked)}
              />
              <span>Shuffle Question</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.showFeedback}
                onCheckedChange={(checked) => handleChange('showFeedback', checked)}
              />
              <span>Show Feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.show}
                onCheckedChange={(checked) => handleChange('show', checked)}
              />
              <span>Show</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={formData.showRightAnswerAfterResult}
                onCheckedChange={(checked) => handleChange('showRightAnswerAfterResult', checked)}
              />
              <span>Show Right Answer after Result</span>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Question" value={formData.totalQuestions} onChange={e => handleChange('totalQuestions', e.target.value)} />
            <Input label="Total Marks" value={formData.totalMarks} onChange={e => handleChange('totalMarks', e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            <Icon name="Save" size={16} className="mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessmentModal;
