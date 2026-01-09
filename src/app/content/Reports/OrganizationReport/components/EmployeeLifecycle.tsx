"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelItem {
  stage: string;
  value: number;
  color: string;
}

export const EmployeeLifecycle = () => {
  const [funnelData, setFunnelData] = useState<FunnelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState({
    url: "",
    token: "",
    subInstituteId: "",
  });

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const { APP_URL, token, sub_institute_id } = JSON.parse(userData);
      setSessionData({
        url: APP_URL,
        token,
        subInstituteId: sub_institute_id,
      });
    }
    
  }, []);

  useEffect(() => {
    if (!sessionData.url) return;

    fetch(`${sessionData.url}/api/reports/employees/lifecycle?sub_institute_id=${sessionData.subInstituteId}&type=API&token=${sessionData.token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setFunnelData(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching employee lifecycle data:', err);
        setLoading(false);
      });
  }, [sessionData]);
  const calculatePercentage = (currentValue: number, previousValue?: number) => {
    if (!previousValue) return 100;
    return (currentValue / previousValue) * 100;
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl sm:text-2xl font-bold text-gray-800">
          Employee Funnel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {loading ? (
          <div className="text-center py-8">Loading employee lifecycle data...</div>
        ) : (
          <>
              {/* Desktop Funnel with Percentages */}
              <div className="hidden md:block relative min-h-80">
          {funnelData.map((item, index) => {
            const widthPercent = ((item.value / funnelData[0].value) * 100);
            // const leftOffset = (100 - widthPercent) / 2;
            // Pre-calculated left offsets for perfect funnel shape
            const leftOffsets = [0, 23.72, 35.2, 40.55, 42.5];
            const conversionRate = index > 0 
              ? calculatePercentage(item.value, funnelData[index - 1].value).toFixed(1)
              : null;

            return (
              <div
                key={item.stage}
                className="flex items-center justify-between mb-3 transition-all duration-300 hover:scale-[1.02]"
                style={{
                  width: `${Math.max(widthPercent, 15)}%`, // Minimum width for readability
                  marginLeft: `${leftOffsets[index]}%`,
                }}
              >
                <div 
                  className="w-full py-4 px-6 rounded-lg flex items-center justify-between shadow-md hover:shadow-lg transition-shadow relative group"
                  style={{ backgroundColor: item.color }}
                >
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-semibold text-base sm:text-lg">
                      {item.stage}
                    </span>
                   
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-bold text-lg sm:text-xl">
                      {item.value.toLocaleString()}
                    </span>
                    
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet Stacked Cards */}
        <div className="md:hidden space-y-3">
          {funnelData.map((item, index) => {
            const conversionRate = index > 0 
              ? calculatePercentage(item.value, funnelData[index - 1].value).toFixed(1)
              : null;
            const overallPercentage = ((item.value / funnelData[0].value) * 100).toFixed(1);

            return (
              <div
                key={item.stage}
                className="rounded-lg p-4 shadow-md transition-all duration-200 hover:shadow-lg"
                style={{ backgroundColor: item.color }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-white font-semibold text-sm sm:text-base block">
                      {item.stage}
                    </span>
                    {conversionRate && (
                      <span className="text-white text-opacity-90 text-xs mt-1">
                        Conversion: {conversionRate}%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-white font-bold text-base sm:text-lg block">
                      {item.value.toLocaleString()}
                    </span>
                    <span className="text-white text-opacity-80 text-xs">
                      {overallPercentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-white bg-opacity-70 transition-all duration-500"
                    style={{ 
                      width: `${(item.value / funnelData[0].value) * 100}%` 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};