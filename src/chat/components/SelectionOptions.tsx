import React from 'react';

export interface SelectionOptionsProps {
  options: Array<{ id: string; label: string }>;
  onSelect: (optionId: string) => void;
  title?: string;
}

export const SelectionOptions: React.FC<SelectionOptionsProps> = ({ options, onSelect, title }) => {
  return (
    <div className="selection-options">
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      <div className="grid gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className="p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};