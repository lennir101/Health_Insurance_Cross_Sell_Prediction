import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface LineChartComponentProps {
  data: any[];
  xDataKey: string;
  lines: { dataKey: string; color: string; name?: string }[];
  title?: string;
  height?: number;
}

const LineChartComponent: React.FC<LineChartComponentProps> = ({ 
  data, 
  xDataKey, 
  lines, 
  title,
  height = 300
}) => {
  return (
    <div className="w-full">
      {title && <h3 className="text-base font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
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
          {lines.map((line, index) => (
            <Line 
              key={`line-${index}`} 
              type="monotone" 
              dataKey={line.dataKey} 
              stroke={line.color} 
              name={line.name || line.dataKey} 
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChartComponent; 