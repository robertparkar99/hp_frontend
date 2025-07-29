'use client';

import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import { saveAs } from 'file-saver';

const SystemConfiguration = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    departmentName: '',
    assignedTo: '',
    dueDate: '',
    attachment: null,
  });

  const [dataList, setDataList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file?.name || '');
    handleChange('attachment', file || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setDataList(prev => [...prev, formData]);
    setFormData({
      name: '',
      description: '',
      departmentName: '',
      assignedTo: '',
      dueDate: '',
      attachment: null,
    });
    setFileName('');
  };

  const exportToCSV = () => {
    const csv = [
      ['Sr No.', 'Name', 'Description', 'Standard Name', 'Assigned To', 'Due Date', 'Attachment'],
      ...dataList.map((item, i) => [
        i + 1,
        item.name,
        item.description,
        item.departmentName,
        item.assignedTo,
        item.dueDate,
        item.attachment?.name || 'N/A',
      ])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'submitted-data.csv');
  };

  const columns = [
    {
      name: 'Sr No.',
      selector: (_, index) => index + 1,
      width: '80px',
      sortable: true,
    },
    {
      name: 'Name',
      selector: row => row.name,
      sortable: true,
    },
    {
      name: 'Description',
      selector: row => row.description,
      sortable: true,
    },
    {
      name: 'Standard Name',
      selector: row => row.departmentName,
      sortable: true,
    },
    {
      name: 'Assigned To',
      selector: row => row.assignedTo,
      sortable: true,
    },
    {
      name: 'Due Date',
      selector: row => row.dueDate,
      sortable: true,
    },
    {
      name: 'Attachment',
      selector: row => row.attachment?.name || 'N/A',
    },
    {
      name: 'Actions',
      cell: (_, index) => (
        <button
          className="text-red-600 hover:underline"
          onClick={() => {
            const updated = [...dataList];
            updated.splice(index, 1);
            setDataList(updated);
          }}
        >
          Delete
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow border border-gray-200 p-6 rounded-lg"
      >
        {[
          { label: 'Name', name: 'name', type: 'text' },
          { label: 'Description', name: 'description', type: 'textarea' },
          { label: 'Department Name', name: 'departmentName', type: 'text' },
        ].map(({ label, name, type }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={formData[name]}
                onChange={e => handleChange(name, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            ) : (
              <input
                type="text"
                value={formData[name]}
                onChange={e => handleChange(name, e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
          <select
            value={formData.assignedTo}
            onChange={e => handleChange('assignedTo', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          >
            <option value="">Select User</option>
            <option value="User A">User A</option>
            <option value="User B">User B</option>
            <option value="User C">User C</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => handleChange('dueDate', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachment</label>
          <label className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50 transition">
            <input type="file" className="hidden" onChange={handleFileChange} />
            <span className="text-gray-600 truncate">{fileName || 'Choose file'}</span>
          </label>
        </div>

        <div className="col-span-1 md:col-span-3 flex justify-center">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition"
          >
            Submit
          </button>
        </div>
      </form>

      <div className="my-6 flex flex-wrap gap-4">
        <button
          onClick={() => setShowTable(prev => !prev)}
          className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded border border-cyan-300 hover:bg-cyan-200"
        >
          View Added Data
        </button>
        {showTable && (
          <>
            <button
              onClick={exportToCSV}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Print
            </button>
          </>
        )}
      </div>

      {showTable && (
        <DataTable
          columns={columns}
          data={dataList}
          pagination
          striped
          highlightOnHover
          responsive
        />
      )}
    </div>
  );
};

export default SystemConfiguration;
