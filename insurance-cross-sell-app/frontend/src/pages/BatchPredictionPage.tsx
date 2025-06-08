import React, { useState } from 'react';
import { PageContainer } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChartComponent, BarChartComponent } from '@/components/charts';

const BatchPredictionPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{
    totalRecords: number;
    processedRecords: number;
    positiveCount: number;
    negativeCount: number;
    highProbabilityCount: number;
    predictionData: Array<{
      id: number;
      gender: string;
      age: number;
      vehicle_age: string;
      probability: number;
      prediction: number;
    }>;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    
    // 模擬上傳過程
    setTimeout(() => {
      setUploading(false);
      setProcessing(true);
      
      // 模擬處理過程
      setTimeout(() => {
        // 生成隨機預測結果
        const totalRecords = Math.floor(Math.random() * 500) + 100;
        const positiveCount = Math.floor(totalRecords * (Math.random() * 0.3 + 0.1));
        const negativeCount = totalRecords - positiveCount;
        const highProbabilityCount = Math.floor(positiveCount * (Math.random() * 0.6 + 0.3));
        
        // 生成示例數據
        const predictionData = Array.from({ length: 10 }, (_, i) => {
          const probability = Math.random();
          return {
            id: i + 1,
            gender: Math.random() > 0.5 ? '男' : '女',
            age: Math.floor(Math.random() * 50) + 20,
            vehicle_age: ['< 1年', '1-2年', '> 2年'][Math.floor(Math.random() * 3)],
            probability,
            prediction: probability > 0.5 ? 1 : 0
          };
        });
        
        setResults({
          totalRecords,
          processedRecords: totalRecords,
          positiveCount,
          negativeCount,
          highProbabilityCount,
          predictionData
        });
        
        setProcessing(false);
      }, 2000);
    }, 1500);
  };

  const renderResults = () => {
    if (!results) return null;
    
    const { 
      totalRecords, 
      positiveCount, 
      negativeCount, 
      highProbabilityCount, 
      predictionData 
    } = results;
    
    const positivePercent = ((positiveCount / totalRecords) * 100).toFixed(1);
    const negativePercent = ((negativeCount / totalRecords) * 100).toFixed(1);
    
    const pieChartData = [
      { name: '有意願', value: parseFloat(positivePercent), color: '#8884d8' },
      { name: '無意願', value: parseFloat(negativePercent), color: '#82ca9d' }
    ];
    
    const probabilityDistribution = [
      { name: '0-25%', value: Math.floor(Math.random() * 30) + 20 },
      { name: '26-50%', value: Math.floor(Math.random() * 20) + 15 },
      { name: '51-75%', value: Math.floor(Math.random() * 15) + 10 },
      { name: '76-100%', value: Math.floor(Math.random() * 10) + 5 }
    ];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>批量預測結果摘要</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md bg-slate-50">
                      <p className="text-sm text-muted-foreground">總記錄數</p>
                      <p className="text-2xl font-bold">{totalRecords}</p>
                    </div>
                    <div className="p-4 border rounded-md bg-slate-50">
                      <p className="text-sm text-muted-foreground">高意願客戶</p>
                      <p className="text-2xl font-bold">{highProbabilityCount}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>預測為有意願</span>
                      <span className="font-medium">{positiveCount} ({positivePercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${positivePercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>預測為無意願</span>
                      <span className="font-medium">{negativeCount} ({negativePercent}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${negativePercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <PieChartComponent 
                  data={pieChartData} 
                  title="預測結果分布"
                  height={220}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>客戶意願概率分布</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartComponent 
              data={probabilityDistribution}
              xDataKey="name"
              bars={[{ dataKey: 'value', color: '#8884d8', name: '客戶數' }]}
              height={250}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>預測結果明細 (前10條)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="p-2 border text-left">ID</th>
                    <th className="p-2 border text-left">性別</th>
                    <th className="p-2 border text-left">年齡</th>
                    <th className="p-2 border text-left">車齡</th>
                    <th className="p-2 border text-left">意願概率</th>
                    <th className="p-2 border text-left">預測結果</th>
                  </tr>
                </thead>
                <tbody>
                  {predictionData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2 border">{item.id}</td>
                      <td className="p-2 border">{item.gender}</td>
                      <td className="p-2 border">{item.age}</td>
                      <td className="p-2 border">{item.vehicle_age}</td>
                      <td className="p-2 border">{(item.probability * 100).toFixed(2)}%</td>
                      <td className="p-2 border">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.prediction === 1 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.prediction === 1 ? '有意願' : '無意願'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 text-center">
              <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors">
                下載完整結果 CSV
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <PageContainer
      title="批量預測"
      description="上傳包含多個客戶資料的 CSV 文件，進行批量預測"
    >
      <div className="flex flex-col gap-6">
        <p className="text-lg">
          上傳含有多個客戶資料的 CSV 文件，系統將分析這些客戶是否有興趣購買車險。
        </p>
        
        <Card>
          <CardHeader>
            <CardTitle>文件上傳</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">選擇 CSV 文件</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  請上傳包含客戶資料的 CSV 文件。文件必須包含所有必要的特徵列。
                </p>
              </div>
              
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!file || uploading || processing}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                >
                  {uploading 
                    ? '上傳中...' 
                    : processing 
                      ? '處理中...' 
                      : '上傳並預測'}
                </button>
              </div>
              
              {(uploading || processing) && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${uploading ? 30 : 70}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {uploading ? '正在上傳文件...' : '正在處理預測...'}
                  </p>
                </div>
              )}
            </form>
            
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">CSV 格式要求</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>必須包含以下列: gender, age, driving_license, region_code, previously_insured, vehicle_age, vehicle_damage, annual_premium, policy_sales_channel, vintage</li>
                <li>第一行必須是列名</li>
                <li>數值型欄位不可包含非數字字符</li>
                <li>文件大小不超過 10MB</li>
              </ul>
              <div className="mt-2">
                <a href="#" className="text-sm text-blue-600 hover:underline">
                  下載模板 CSV 文件
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {results && renderResults()}
      </div>
    </PageContainer>
  );
};

export default BatchPredictionPage; 