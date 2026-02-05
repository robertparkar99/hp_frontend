import React from 'react';

const ReportEnginePage = () => {
    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <iframe
                title="Dynamic Report Engine"
                width="1140"
                height="541.25"
                src="https://lookerstudio.google.com/embed/reporting/22f1fa8e-3aeb-4d85-9a77-2adec0b116a0/page/NTbnF"
                frameBorder="0"
                allowFullScreen={true}
            ></iframe>
        </div>
    );
};

export default ReportEnginePage;
