// CreateAssessmentModal.jsx
import React, { useEffect, useState } from 'react';
import Icon from '../../../../../components/AppIcon';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Select } from '../../../../../components/ui/select';
import { Checkbox } from '../../../../../components/ui/checkbox';
import SearchFilters from '../../../../../components/searchfileds/SearchFilters';

const CreateAssessmentModal = ({ isOpen, onClose, onSave }) => {
  const [sessionData, setSessionData] = useState({});
  const [formData, setFormData] = useState({
    searchSection: '',
    searchStandard: '',
    subject: '',
    searchByChapter: [],
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

  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
        setSessionData({ url: APP_URL, token, sub_institute_id });
      }
    }
  }, []);

  // 🔥 Auto update totals when selection changes
  useEffect(() => {
    const selectedQuestions = searchResults.filter(q => q.selected);
    const totalQuestions = selectedQuestions.length;
    const totalMarks = selectedQuestions.reduce(
      (sum, q) => sum + (parseFloat(q.points) || 0),
      0
    );

    setFormData(prev => ({
      ...prev,
      totalQuestions: String(totalQuestions),
      totalMarks: String(totalMarks),
    }));
  }, [searchResults]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let sub_institute_id = '';
      try {
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedData = JSON.parse(userData);
            sub_institute_id = parsedData.sub_institute_id || '';
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }

      const params = new URLSearchParams();
      params.append('type', 'API');
      params.append('action', 'Search');
      params.append('syear', new Date().getFullYear());
      params.append('grade', '');
      

      if (sub_institute_id) params.append('sub_institute_id', sub_institute_id);
      if (formData.searchSection) params.append('grade', formData.searchSection);
      if (formData.searchStandard) params.append('standard', formData.searchStandard);
      if (formData.subject) params.append('subject', formData.subject);

     if (Array.isArray(formData.searchByChapter) && formData.searchByChapter.length > 0) {
  formData.searchByChapter.forEach((item, index) => {
    const id = item?.value ?? item;   // handles both object or pure value
    params.append(`search_chapter[${index}]`, id);
  });
}

      if (formData.searchByTopic) params.append('search_topic', formData.searchByTopic);
      if (formData.searchByMappingType) params.append('search_mapping_type', formData.searchByMappingType);
      if (formData.searchByMappingValue) params.append('search_mapping_value', formData.searchByMappingValue);

      const apiUrl = `${sessionData.url}/question_paper/search_question?${params.toString()}`;
      console.log('API URL:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      const questionsWithSelection = Array.isArray(data?.questionData)
        ? data.questionData.map(q => ({ ...q, selected: false }))
        : [];

      setSearchResults(questionsWithSelection);
    } catch (error) {
      console.error('Error searching questions:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const saveExamData = async (examData) => {
    try {
      setSaving(true);

      let user_id = '';
      let sub_institute_id = '';
      try {
        if (typeof window !== 'undefined') {
          const userData = localStorage.getItem('userData');
          if (userData) {
            const parsedData = JSON.parse(userData);
            user_id = parsedData.user_id || '';
            sub_institute_id = parsedData.sub_institute_id || '';
          }
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }

      const payload = {
        type: 'API',
        action: 'Store',
        user_id: user_id || '',
        created_by: user_id || '',
        sub_institute_id: sub_institute_id || '',
        syear: new Date().getFullYear(),
        grade: examData.searchSection || '',
        standard: examData.searchStandard || '',
        subject: examData.subject || '',
        paper_name: examData.examName || '',
        paper_desc: examData.examDescription || '',
        attempt_allowed: examData.attemptAllowed || '1',
        open_date: examData.openDate || new Date().toISOString().split('T')[0],
        close_date: examData.closeDate || new Date().toISOString().split('T')[0],
        timelimit_enable: examData.enableTimeLimit ? 1 : 0,
        time_allowed: examData.allowedTime || '60',
        exam_type: examData.examType || 'online',
        shuffle_question: examData.shuffleQuestions ? 1 : 0,
        show_feedback: examData.showFeedback ? 1 : 0,
        show_hide: examData.show ? 1 : 0,
        result_show_ans: examData.showRightAnswerAfterResult ? 1 : 0,
        total_ques: examData.totalQuestions || '0',
        total_marks: examData.totalMarks || '0',
        question_ids: examData.selectedQuestions.map(q => q.question_id || q.id || ''),
      };

      console.log('Saving exam data:', payload);

      const response = await fetch(`${sessionData.url}/lms/question_paper/storeData`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to save exam: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Exam save response:', result);

      if (result.status === 'success') {
        alert(result.message || 'Exam created successfully!');
        return true;
      } else {
        alert(result.message || 'Failed to create exam.');
        return false;
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to create exam. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const requiredFields = [
      { key: "examName", label: "Exam Name / Paper Name" },
      { key: "examDescription", label: "Exam Description / Paper Description" },
      { key: "attemptAllowed", label: "Attempt Allowed" },
      { key: "openDate", label: "Open Date" },
      { key: "closeDate", label: "Close Date" },
      { key: "allowedTime", label: "Allowed Time (mins)" },
      { key: "totalQuestions", label: "Total Question" },
      { key: "totalMarks", label: "Total Marks" },
    ];

    for (let field of requiredFields) {
      if (!formData[field.key] || formData[field.key].toString().trim() === "") {
        alert(`${field.label} is required.`);
        return;
      }
    }

    const selectedQuestions = searchResults.filter(r => r.selected);
    if (selectedQuestions.length === 0) {
      alert("Please select at least one question.");
      return;
    }

    const invalidQuestions = selectedQuestions.filter(
      q => !q.correct_answer ||
        q.correct_answer.toString().trim() === "" ||
        q.correct_answer.toString().trim() === "-" ||
        q.correct_answer.toString().trim() === "N/A"
    );

    if (invalidQuestions.length > 0) {
      alert("Please mapped answer first.");
      return;
    }

    const success = await saveExamData({ ...formData, selectedQuestions });

 if (success) {
  onSave(true);   // tell parent it was successful
  onClose();
} else {
  onSave(false);  // tell parent it failed
}

  };

  if (!isOpen) return null;

  return (
    <div className="fixed z-1000 inset-0 bg-black/50 z-modal flex items-center justify-center p-4">
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
            showSearchButton={true}
          />

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Assesment Name / Paper Name <span className="text-red-500">*</span></label>
              <Input value={formData.examName} onChange={e => handleChange('examName', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Assesment Description / Paper Description <span className="text-red-500">*</span></label>
              <Input value={formData.examDescription} onChange={e => handleChange('examDescription', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Attempt Allowed <span className="text-red-500">*</span></label>
              <select
                value={formData.attemptAllowed}
                onChange={e => handleChange("attemptAllowed", e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Attempts</option>
                <option value="Unlimited">Unlimited</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            {/* <Select
              label="Attempt Allowed *"
              value={formData.attemptAllowed}
              onChange={v => handleChange("attemptAllowed", v)}
              options={[
                { value: "Unlimited", label: "Unlimited" },
                ...Array.from({ length: 10 }, (_, i) => ({
                  value: String(i + 1),
                  label: String(i + 1),
                })),
              ]}
            /> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Open Date <span className="text-red-500">*</span></label>
              <Input type="date" value={formData.openDate} onChange={e => handleChange("openDate", e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Close Date <span className="text-red-500">*</span></label>
              <Input type="date" value={formData.closeDate} onChange={e => handleChange("closeDate", e.target.value)} />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.enableTimeLimit} onCheckedChange={checked => handleChange('enableTimeLimit', checked)} className={`border-gray-300 rounded-sm 
    ${formData.enableTimeLimit ? "bg-blue-400 border-blue-400" : "bg-white border-blue-600"}`} />
              <span>Enable Time Limit</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* <div>
              <label className="block text-sm font-medium mb-1">Allowed Time (mins) <span className="text-red-500">*</span></label>
              <Input type="number" value={formData.allowedTime} onChange={e => handleChange("allowedTime", e.target.value)} />
            </div> */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Allowed Time (mins) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.allowedTime}
                onChange={e => {
                  const value = Math.min(20, parseInt(e.target.value) || 0);
                  handleChange("allowedTime", value);
                }}
                min="0"
                max="20"
              />
              {formData.allowedTime > 20 && (
                <p className="text-red-500 text-xs mt-1">Maximum allowed time is 20 minutes</p>
              )}
            </div>

            <div>
              <label className="block mb-1">Assesment Type</label>
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
              {/* <Checkbox checked={formData.shuffleQuestions} onCheckedChange={checked => handleChange('shuffleQuestions', checked)} /> */}
              <Checkbox
                checked={formData.shuffleQuestions}
                onCheckedChange={(checked) => handleChange("shuffleQuestions", checked)}
                className={`border-gray-300 rounded-sm 
    ${formData.shuffleQuestions ? "bg-blue-400 border-blue-400" : "bg-white border-blue-600"}`}
              />
              <span>Shuffle Question</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.showFeedback} onCheckedChange={checked => handleChange('showFeedback', checked)} className={`border-gray-300 rounded-sm 
    ${formData.showFeedback ? "bg-blue-400 border-blue-400" : "bg-white border-blue-600"}`} />
              <span>Show Feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.show} onCheckedChange={checked => handleChange('show', checked)} className={`border-gray-300 rounded-sm 
    ${formData.show ? "bg-blue-400 border-blue-400" : "bg-white border-blue-600"}`} />
              <span>Show</span>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={formData.showRightAnswerAfterResult} onCheckedChange={checked => handleChange('showRightAnswerAfterResult', checked)} className={`border-gray-300 rounded-sm 
    ${formData.showRightAnswerAfterResult ? "bg-blue-400 border-blue-400" : "bg-white border-blue-600"}`} />
              <span>Show Right Answer after Result</span>
            </div>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Total Question <span className='text-red-500'>*</span></label>
              <Input value={formData.totalQuestions} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks <span className='text-red-500'>*</span></label>
              <Input value={formData.totalMarks} readOnly />
            </div>
          </div>

          {/* Search Results Table */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Search Results</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-2 text-center w-12 whitespace-nowrap">
                        <Checkbox
                          checked={searchResults.length > 0 && searchResults.every(r => r.selected)}
                          onCheckedChange={checked => {
                            setSearchResults(prev => prev.map(r => ({ ...r, selected: !!checked })));
                          }}
                        />
                      </th>
                      <th className="border border-border p-2 text-left whitespace-normal break-words w-[300px]">Question</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">module</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">module No</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">Topic</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">Question Type</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">Correct Answer</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">Marks</th>
                      <th className="border border-border p-2 text-left whitespace-nowrap">Mappings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((result, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                        <td className="border border-border p-2 text-center whitespace-nowrap">
                          <Checkbox
                            checked={!!result.selected}
                            onCheckedChange={checked => {
                              setSearchResults(prev =>
                                prev.map((r, i) => (i === index ? { ...r, selected: !!checked } : r))
                              );
                            }}
                          />
                        </td>
                        <td className="border border-border p-2 whitespace-normal break-words w-[300px]">{result.question_title || 'N/A'}</td>
                        <td className="border border-border p-2 whitespace-nowrap">{result.chapter_name || 'N/A'}</td>
                        <td className="border border-border p-2 whitespace-nowrap">{result.sort_order || index + 1}</td>
                        <td className="border border-border p-2 whitespace-nowrap">{result.topic_name || 'N/A'}</td>
                        <td className="border border-border p-2 whitespace-nowrap">{result.question_type || 'N/A'}</td>
                        <td className="border border-border p-2 whitespace-nowrap">
                          {result.correct_answer || 'N/A'}
                          {result.selected && (
                            !result.correct_answer ||
                            result.correct_answer.toString().trim() === "" ||
                            result.correct_answer.toString().trim() === "-" ||
                            result.correct_answer.toString().trim() === "N/A"
                          ) && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                        </td>
                        <td className="border border-border p-2 whitespace-nowrap">{result.points || 'N/A'}</td>
                        <td className="border border-border p-2 whitespace-nowrap">{result.mapping_type || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end space-x-3 mt-[-10px]">
          {/* <Button variant="outline" onClick={onClose}>
            Cancel
          </Button> */}
          <Button onClick={handleSave} disabled={saving} className=" mx-auto text-sm px-8 py-2 rounded-full text-white font-semibold bg-gradient-to-r from-blue-500 to-blue-700">
            {saving ? "Saving..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateAssessmentModal;
