import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart
} from 'recharts';

const DemandChart = ({ data, title }) => {
    if (!data || data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No data available for prediction</div>;
    }

    // Separate data into history and prediction logic for visualization if needed.
    // Generally, we can just plot them. But to make "Predicted" distinct, 
    // we might want to use a composed chart or just stylized lines.
    // For simplicity using a LineChart with two lines if data structure allows, 
    // or a single line if data is sequential.
    // Based on my backend, data is: [{date, actual, predicted}]
    // 'actual' is null for future dates, 'predicted' is null for past dates (or we can populate both).

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">{title || "Demand Trend Analysis"}</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={data}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Line
                            type="monotone"
                            dataKey="actual"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            name="Actual Sales"
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="predicted"
                            stroke="#10b981"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            name="Predicted Demand"
                            dot={{ r: 4, strokeWidth: 2 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 flex gap-4 text-sm text-gray-500 justify-center">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                    <span>Historical Data</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <span>AI Prediction</span>
                </div>
            </div>
        </div>
    );
};

export default DemandChart;
