import React from 'react';

const ReportEnginePage = () => {
    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <iframe
                title="Dynamic Report Engine"
                width="1140"
                height="541.25"
                src="https://app.powerbi.com/reportEmbed?reportId=630ea57b-f6ef-459a-8de0-34cbf2f4c880&autoAuth=true&ctid=2aec0306-98a8-409a-aba6-fd9c91a591dd"
                frameBorder="0"
                allowFullScreen={true}
            ></iframe>
        </div>
    );
};

export default ReportEnginePage;
