import React from 'react';
import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip} from 'recharts';

interface DataItem {
    name: string;
    value: number;
    color: string;
}

interface PieChartComponentProps {
    data: DataItem[];
    title?: string;
    height?: number;
}

const PieChartComponent: React.FC<PieChartComponentProps> = ({
                                                                 data,
                                                                 title,
                                                                 height = 300
                                                             }) => {
    return (
        <div className="w-full">
            {title && <h3 className="text-base font-medium mb-2 text-center">{title}</h3>}
            <ResponsiveContainer width="100%" height={height}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color}/>
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => [`${value.toFixed(1)}%`, '佔比']}
                    />
                    <Legend/>
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default PieChartComponent; 