import React, { useState } from 'react';

export interface DynamicInputCollectorProps {
  requiredFields: string[];
  onSubmit: (values: Record<string, string>) => void;
  title?: string;
}

export const DynamicInputCollector: React.FC<DynamicInputCollectorProps> = ({ 
  requiredFields, 
  onSubmit,
  title = "Please provide the required information:"
}) => {
  const [values, setValues] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const allFilled = requiredFields.every(field => values[field]?.trim() !== '');
    if (allFilled) {
      onSubmit(values);
    }
  };

  const formatFieldLabel = (field: string) => {
    return field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="dynamic-input-collector">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="space-y-3">
        {requiredFields.map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium mb-1">
              {formatFieldLabel(field)}
            </label>
            <input
              type={field.toLowerCase().includes('date') ? 'date' : 'text'}
              value={values[field] || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="w-full p-2 border rounded"
              placeholder={`Enter ${formatFieldLabel(field).toLowerCase()}`}
            />
          </div>
        ))}
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>
    </div>
  );
};