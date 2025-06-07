import * as XLSX from 'xlsx';
import React from 'react';

interface SheetData {
  data: any[];
  sheetName: string;
}

interface ExcelExportButtonProps {
  sheets: SheetData[] | any[];
  fileName: string;
  buttonText?: React.ReactNode; // Change this line
  className?: string;
  disabled?: boolean;
  singleSheetName?: string;
  onClick?: () => void;
}

export const ExcelExportButton: React.FC<ExcelExportButtonProps> = ({
  sheets,
  fileName,
  buttonText = 'Export to Excel', // You can still have a default string
  className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
  disabled = false,
  singleSheetName = 'Sheet1',
  onClick,
}) => {
  const handleExport = () => {
    if (onClick) {
      onClick();
    }

    const workbook = XLSX.utils.book_new();

    if (Array.isArray(sheets[0]?.data)) {
      (sheets as SheetData[]).forEach((sheet) => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
      });
    } else {
      const worksheet = XLSX.utils.json_to_sheet(sheets as any[]);
      XLSX.utils.book_append_sheet(workbook, worksheet, singleSheetName);
    }

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const isDisabled = disabled ||
    (Array.isArray(sheets[0]?.data)
      ? (sheets as SheetData[]).every(s => s.data.length === 0)
      : (sheets as any[]).length === 0);

  return (
    <button
      onClick={handleExport}
      className={className}
      disabled={isDisabled}
      type="button"
    >
      {buttonText} {/* This will now render the React Node directly */}
    </button>
  );
};

export default ExcelExportButton;