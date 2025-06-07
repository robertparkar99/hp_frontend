import React from 'react';

interface PrintButtonProps {
  data: any[];
  className?: string;
  buttonText?: React.ReactNode;
  title?: string;
  excludedFields?: string[];
  // Add any other custom props your button might receive
  allowOverflow?: boolean; // If you actually need this prop
  asButton?: boolean;     // If you actually need this prop
}

export const PrintButton: React.FC<PrintButtonProps> = ({
  data,
  className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded',
  buttonText = <span className="mdi mdi-printer-outline"></span>,
  title = 'Job Roles',
  excludedFields = [],
  allowOverflow,    // Destructure but don't pass to button
  asButton,        // Destructure but don't pass to button
  ...rest          // Capture any other unexpected props
}) => {
  const handlePrint = () => {
    if (data.length === 0) return;

    const allKeys = Array.from(
      new Set(data.flatMap(item => Object.keys(item)))
    ).filter(key => !excludedFields.includes(key));

    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th { 
                background-color: #007bff; 
                color: white; 
                padding: 10px; 
                text-align: left; 
                font-size: 14px; 
                position: sticky;
                top: 0;
              }
              td { 
                padding: 8px; 
                border-bottom: 1px solid #ddd; 
                vertical-align: top;
              }
              tr:nth-child(even) { background-color: #f2f2f2; }
              @media print {
                body { padding: 0; margin: 0; }
                table { width: 100%; }
                th { background-color: #007bff !important; color: white !important; }
              }
            </style>
          </head>
          <body>
            <h1>${title}</h1>
            <table>
              <thead>
                <tr>
                  ${allKeys.map(key => `<th>${formatHeader(key)}</th>`).join('')}
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr>
                    ${allKeys.map(key => `
                      <td>${formatCellValue(item[key])}</td>
                    `).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 200);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const formatHeader = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (value instanceof Date) return value.toLocaleString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <button
      onClick={handlePrint}
      className={className}
      disabled={data.length === 0}
      type="button"
      {...rest} // Spread any additional valid button props
    >
      {buttonText}
    </button>
  );
};