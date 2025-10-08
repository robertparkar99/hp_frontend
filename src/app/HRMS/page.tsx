'use client';

import React from 'react';
// import PayrollTypeTable from '../content/HRMS/Payroll/PayrollTypeTable';
// import PayrollTypeTable from '../content/HRMS/PayRoll/PayrollTypeTable';
import PayrollTypes from '../content/HRMS/Payroll/Payroll-type/PayrollTypes';
export default function APP() {
  return (
    <div className="p-6">
      {/* <h1 className="text-xl font-semibold mb-4">Payroll Types</h1> */}
      {/* <PayrollTypeTable /> */}
      <PayrollTypes />
     </div>
  );
}