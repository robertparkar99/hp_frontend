import React, { useState } from 'react';
import { Bot, ChevronLeft, CalendarRange } from 'lucide-react';

interface SelectionOption {
  id: string;
  label: string;
}

interface InputField {
  name: string;
  type: string;
  label: string;
}

interface LeaveAnalysisSelectionProps {
  messageId: string;
  messages: any[];
  setInput: (input: string) => void;
  onRunAnalysis?: (analysisType: string, fromDate: string, toDate: string) => void;
}

export const LeaveAnalysisSelection: React.FC<LeaveAnalysisSelectionProps> = ({ 
  messageId, 
  messages, 
  setInput,
  onRunAnalysis
}) => {
  // Prefer the most recent matching message so duplicate Date.now() ids do not
  // accidentally resolve to the user message instead of the bot prompt.
  const message = [...messages].reverse().find(m => m.id === messageId);
  const options = (message?.metadata?.selectionOptions || []) as SelectionOption[];
  const inputFields = (message?.metadata?.inputFields || [
    { name: 'from_date', type: 'date', label: 'From Date' },
    { name: 'to_date', type: 'date', label: 'To Date' },
  ]) as InputField[];
  const stepLabel = message?.metadata?.stepLabel || 'Please choose an analysis type.';
  const [step, setStep] = useState<'analysisType' | 'dateRange'>('analysisType');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<string | null>(null);

  const handleAnalysisTypeSelect = (optionId: string) => {
    console.log('[LeaveAnalysisSelection] Selected:', optionId);
    setSelectedAnalysisType(optionId);
    setStep('dateRange');
  };

  const handleBack = () => {
    setStep('analysisType');
    setFromDate('');
    setToDate('');
  };

  const handleSubmit = () => {
    if (!fromDate || !toDate || !selectedAnalysisType) return;
    const inputText = `${selectedAnalysisType} from ${fromDate} to ${toDate}`;
    setInput(inputText);
    // Auto-submit if callback provided
    if (onRunAnalysis) {
      onRunAnalysis(selectedAnalysisType, fromDate, toDate);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-orange-200 bg-[linear-gradient(180deg,rgba(255,247,237,1),rgba(255,251,235,0.96))] p-4 shadow-sm">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-orange-950">
        <Bot className="w-4 h-4 text-orange-600" />
        {step === 'analysisType' ? stepLabel : 'Please select date range.'}
      </h4>
      <div className="space-y-4">
        {step === 'analysisType' && (
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">
              Analysis Type
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleAnalysisTypeSelect(option.id)}
                  className="rounded-xl border border-orange-200 bg-white/90 p-3 text-left text-sm transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'dateRange' && selectedAnalysisType && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm text-orange-950">
              <CalendarRange className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Selected pattern:</span>
              <span className="font-semibold">{selectedAnalysisType.replace(/_/g, ' ')}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {inputFields.map((field) => (
                <div key={field.name}>
                  <label className="text-xs font-medium text-gray-700">{field.label}:</label>
                  <input
                    type={field.type}
                    value={field.name === 'from_date' ? fromDate : toDate}
                    onChange={(e) => field.name === 'from_date' ? setFromDate(e.target.value) : setToDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-medium text-orange-900 transition-colors hover:bg-orange-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Change analysis type
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!fromDate || !toDate || !selectedAnalysisType}
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Analyze
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
