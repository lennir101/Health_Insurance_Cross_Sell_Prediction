import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface HorizontalBarChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  color?: string;
  title?: string;
  height?: number;
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({ 
  data, 
  dataKey, 
  nameKey,
  color = '#8884d8',
  title,
  height = 400
}) => {
  // 對數據進行排序，確保條形按值大小排列
  const sortedData = [...data].sort((a, b) => a[dataKey] - b[dataKey]);

  return (
    <div className="w-full">
      {title && <h3 className="text-base font-medium mb-2 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical"
          data={sortedData}
          margin={{
            top: 5,
            right: 30,
            left: 80,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey={nameKey} />
          <Tooltip 
            formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '重要性']}
          />
          <Bar dataKey={dataKey} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalBarChart; 