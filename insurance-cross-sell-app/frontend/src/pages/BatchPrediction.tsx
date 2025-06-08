import React, { useState, useRef } from 'react';
import predictionService, { CustomerData, BatchPredictionResult } from '../services/predictionService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F'];

const BatchPrediction: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CustomerData[]>([]);
  const [predictionResult, setPredictionResult] = useState<BatchPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          // 只預覽前5行
          const previewRows = lines.slice(1, 6).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row: Record<string, any> = {};
            
            headers.forEach((header, index) => {
              // 轉換數據類型
              const value = values[index];
              if (!isNaN(Number(value))) {
                row[header] = Number(value);
              } else {
                row[header] = value;
              }
            });
            
            return row as CustomerData;
          });
          
          setPreviewData(previewRows);
          setError(null);
        } catch (err) {
          console.error('CSV解析錯誤:', err);
          setError('無法解析CSV文件，請確保格式正確');
          setPreviewData([]);
        }
      };
      reader.readAsText(selectedFile);
    } else {
      setPreviewData([]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('請選擇要上傳的CSV文件');
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setError(null);
    
    try {
      // 解析整個CSV文件
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n').filter(line => line.trim());
          const headers = lines[0].split(',').map(h => h.trim());
          
          const allData: CustomerData[] = [];
          const totalRows = lines.length - 1;
          
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row: Record<string, any> = {};
            
            headers.forEach((header, index) => {
              const value = values[index];
              if (!isNaN(Number(value))) {
                row[header.toLowerCase()] = Number(value);
              } else {
                row[header.toLowerCase()] = value;
              }
            });
            
            allData.push(row as CustomerData);
            
            // 更新進度
            setProgress(Math.floor((i / totalRows) * 50)); // 解析占50%進度
          }
          
          // 發送預測請求
          const result = await predictionService.predictBatch(allData);
          setPredictionResult(result);
          setProgress(100);
        } catch (err) {
          console.error('批量預測錯誤:', err);
          setError('處理數據時出錯，請確保CSV格式正確且包含所有必要字段');
        } finally {
          setLoading(false);
        }
      };
      
      reader.readAsText(file);
    } catch (err) {
      console.error('文件讀取錯誤:', err);
      setError('無法讀取文件');
      setLoading(false);
    }
  };
  
  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setPredictionResult(null);
    setError(null);
    setProgress(0);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const preparePredictionDistributionData = () => {
    if (!predictionResult) return [];
    
    const positive = predictionResult.predictions.filter(p => p.prediction === 1).length;
    const negative = predictionResult.predictions.filter(p => p.prediction === 0).length;
    
    return [
      { name: '可能購買', value: positive },
      { name: '不可能購買', value: negative }
    ];
  };
  
  const prepareProbabilityDistributionData = () => {
    if (!predictionResult) return [];
    
    const ranges = {
      '0-10%': 0,
      '10-20%': 0,
      '20-30%': 0,
      '30-40%': 0,
      '40-50%': 0,
      '50-60%': 0,
      '60-70%': 0,
      '70-80%': 0,
      '80-90%': 0,
      '90-100%': 0
    };
    
    predictionResult.predictions.forEach(p => {
      const prob = p.probability * 100;
      const rangeKey = `${Math.floor(prob / 10) * 10}-${Math.floor(prob / 10) * 10 + 10}%`;
      ranges[rangeKey as keyof typeof ranges]++;
    });
    
    return Object.entries(ranges).map(([range, count]) => ({
      range,
      count
    }));
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">批量保險交叉銷售預測</h1>
      
      <div className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-xl font-bold mb-6">上傳CSV文件</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              選擇包含客戶數據的CSV文件
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              CSV文件應包含以下列: gender, age, driving_license, region_code, previously_insured, vehicle_age, vehicle_damage, annual_premium, policy_sales_channel, vintage
            </p>
          </div>
          
          {previewData.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <h3 className="text-md font-medium mb-2">數據預覽 (前5行)</h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(previewData[0]).map(key => (
                      <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {previewData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {value?.toString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="flex gap-4">
            <button
              type="submit"
              className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              disabled={loading || !file}
            >
              {loading ? '處理中...' : '開始批量預測'}
            </button>
            
            <button
              type="button"
              onClick={resetForm}
              className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              disabled={loading}
            >
              重置
            </button>
          </div>
          
          {loading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">處理中... {progress}%</p>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </form>
      </div>
      
      {predictionResult && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">預測結果摘要</h2>
            <div className="flex flex-col space-y-2">
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">總預測記錄數</div>
                <div className="text-2xl font-bold">{predictionResult.total_count}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">可能購買客戶數</div>
                <div className="text-2xl font-bold text-green-600">
                  {predictionResult.predictions.filter(p => p.prediction === 1).length}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <div className="text-sm text-gray-500">可能購買率</div>
                <div className="text-2xl font-bold">
                  {((predictionResult.predictions.filter(p => p.prediction === 1).length / predictionResult.total_count) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">預測分佈</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={preparePredictionDistributionData()}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {preparePredictionDistributionData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded shadow md:col-span-2">
            <h2 className="text-xl font-bold mb-4">購買可能性分佈</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={prepareProbabilityDistributionData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#8884d8" name="客戶數量" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchPrediction; 