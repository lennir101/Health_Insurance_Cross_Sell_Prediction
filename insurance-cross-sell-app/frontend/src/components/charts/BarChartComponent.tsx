import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface BarChartComponentProps {
  data: any[];
  xDataKey: string;
  bars: { dataKey: string; color: string; name?: string }[];
  title?: string;
  height?: number;
}

const BarChartComponent: React.FC<BarChartComponentProps> = ({ 
  data, 
  xDataKey, 
  bars, 
  title,
  height = 300
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-base font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xDataKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {bars.map((bar, index) => (
            <Bar 
              key={`bar-${index}`} 
              dataKey={bar.dataKey} 
              fill={bar.color} 
              name={bar.name || bar.dataKey} 
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartComponent; 