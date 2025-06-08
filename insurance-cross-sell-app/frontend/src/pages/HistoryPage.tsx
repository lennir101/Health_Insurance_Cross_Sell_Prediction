import React, { useState } from 'react';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChartComponent } from '@/components/charts';

const HistoryPage: React.FC = () => {
  const [filter, setFilter] = useState({
    type: 'all',
    timeRange: 'month',
    page: 1
  });
  
  // 生成假歷史記錄數據
  const historyItems = Array.from({ length: 10 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const isBatch = Math.random() > 0.5;
    const recordCount = isBatch ? Math.floor(Math.random() * 100) + 5 : 1;
    const successRate = Math.floor(Math.random() * 30) + 70;
    
    return {
      id: `hist-${i + 1}`,
      date: date.toLocaleDateString('zh-TW'),
      time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      type: isBatch ? '批量預測' : '單一預測',
      recordCount,
      successRate,
      status: Math.random() > 0.1 ? '完成' : '失敗'
    };
  });
  
  // 趨勢圖數據
  const trendData = [
    { name: '1週前', single: 12, batch: 2 },
    { name: '6天前', single: 9, batch: 1 },
    { name: '5天前', single: 15, batch: 3 },
    { name: '4天前', single: 8, batch: 2 },
    { name: '3天前', single: 11, batch: 1 },
    { name: '2天前', single: 13, batch: 2 },
    { name: '1天前', single: 10, batch: 3 },
    { name: '今天', single: 14, batch: 2 }
  ];
  
  // 統計數據
  const stats = {
    totalPredictions: 187,
    singlePredictions: 152,
    batchPredictions: 35,
    totalRecords: 4328,
    avgSuccessRate: 97.2
  };
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilter(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <PageContainer
      title="預測歷史記錄"
      description="查看之前的預測結果和分析"
    >
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>預測記錄</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="flex gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">預測類型</label>
                  <select
                    name="type"
                    value={filter.type}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md text-sm"
                  >
                    <option value="all">所有類型</option>
                    <option value="single">單一預測</option>
                    <option value="batch">批量預測</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">時間範圍</label>
                  <select
                    name="timeRange"
                    value={filter.timeRange}
                    onChange={handleFilterChange}
                    className="p-2 border rounded-md text-sm"
                  >
                    <option value="week">最近一週</option>
                    <option value="month">最近一個月</option>
                    <option value="quarter">最近三個月</option>
                    <option value="year">最近一年</option>
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                  匯出記錄
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-2 border text-left">ID</th>
                    <th className="p-2 border text-left">日期</th>
                    <th className="p-2 border text-left">時間</th>
                    <th className="p-2 border text-left">預測類型</th>
                    <th className="p-2 border text-left">記錄數</th>
                    <th className="p-2 border text-left">成功率</th>
                    <th className="p-2 border text-left">狀態</th>
                    <th className="p-2 border text-left">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 border">{item.id}</td>
                      <td className="p-2 border">{item.date}</td>
                      <td className="p-2 border">{item.time}</td>
                      <td className="p-2 border">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.type === '批量預測' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                      <td className="p-2 border">{item.recordCount}</td>
                      <td className="p-2 border">{item.successRate}%</td>
                      <td className="p-2 border">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.status === '完成' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-2 border">
                        <div className="flex gap-2">
                          <button className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300">
                            查看
                          </button>
                          <button className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-xs hover:bg-slate-300">
                            下載
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-muted-foreground">
                顯示 1-10 / 187 條記錄
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 border rounded-md disabled:opacity-50">
                  上一頁
                </button>
                <button className="px-3 py-1 border rounded-md bg-blue-50">1</button>
                <button className="px-3 py-1 border rounded-md">2</button>
                <button className="px-3 py-1 border rounded-md">3</button>
                <button className="px-3 py-1 border rounded-md">
                  下一頁
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>預測趨勢</CardTitle>
            </CardHeader>
            <CardContent>
              <LineChartComponent
                data={trendData}
                xDataKey="name"
                lines={[
                  { dataKey: 'single', color: '#8884d8', name: '單一預測' },
                  { dataKey: 'batch', color: '#82ca9d', name: '批量預測' }
                ]}
                height={250}
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>統計摘要</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-slate-50">
                  <p className="text-sm text-muted-foreground">總預測次數</p>
                  <p className="text-2xl font-bold">{stats.totalPredictions}</p>
                  <div className="mt-2 flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      單次: {stats.singlePredictions}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800">
                      批量: {stats.batchPredictions}
                    </span>
                  </div>
                </div>
                <div className="p-4 border rounded-md bg-slate-50">
                  <p className="text-sm text-muted-foreground">總預測記錄數</p>
                  <p className="text-2xl font-bold">{stats.totalRecords}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    包含所有單次和批量預測中的記錄
                  </p>
                </div>
                <div className="col-span-2 p-4 border rounded-md bg-slate-50">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">平均成功率</p>
                    <p className="text-xl font-bold">{stats.avgSuccessRate}%</p>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full" 
                      style={{ width: `${stats.avgSuccessRate}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    預測請求成功完成的百分比
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default HistoryPage; 