import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type PdfExportButtonProps = {
  data: Array<Record<string, any>>;
  fileName: string;
  buttonText?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  data,
  fileName,
  buttonText = 'Export to PDF',
  className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
  disabled = false,
  onClick,
}) => {
  const handleExport = () => {
    if (onClick) {
      onClick();
    }

    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const doc = new jsPDF();
    doc.text("Data Export", 14, 16);

    // Dynamically determine all possible columns from the data
    const allColumns = new Set<string>();
    data.forEach(item => {
      Object.keys(item).forEach(key => allColumns.add(key));
    });

    const columns: string[] = Array.from(allColumns);
    
    // Prepare table data
    const head = columns.map(col => col.toString());
    const body = data.map(item => 
      columns.map(col => {
        const value = item[col];
        if (value === undefined || value === null) return 'N/A';
        if (value instanceof Date) return value.toLocaleString();
        return value.toString();
      })
    );

    autoTable(doc, {
      head: [head],
      body: body,
      startY: 20,
      styles: {
        cellPadding: 2,
        fontSize: 8,
        valign: 'middle',
        halign: 'left',
      },
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10
      },
      columnStyles: columns.reduce<Record<number, any>>((styles, _, index) => {
        styles[index] = { cellWidth: 'auto' };
        return styles;
      }, {})
    });

    doc.save(`${fileName}.pdf`);
  };

  const isDisabled = disabled || !data || data.length === 0;

  return (
    <button
      onClick={handleExport}
      className={className}
      disabled={isDisabled}
      type="button"
    >
      {buttonText}
    </button>
  );
};