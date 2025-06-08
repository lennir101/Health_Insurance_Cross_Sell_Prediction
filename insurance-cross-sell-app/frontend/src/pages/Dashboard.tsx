import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ScatterChart, Scatter,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import predictionService, { StatisticsData, ModelMetrics } from '@/services/predictionService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#8DD1E1', '#A4DE6C', '#D0ED57'];

const Dashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [featureImportance, setFeatureImportance] = useState<Record<string, number> | null>(null);
  const [thresholdAnalysis, setThresholdAnalysis] = useState<Array<{threshold: number; precision: number; recall: number; f1: number}> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, metricsData, importanceData, thresholdData] = await Promise.all([
          predictionService.getStatistics(),
          predictionService.getModelMetrics(),
          predictionService.getFeatureImportance(),
          predictionService.getThresholdAnalysis()
        ]);
        
        setStatistics(statsData);
        setMetrics(metricsData);
        setFeatureImportance(importanceData);
        setThresholdAnalysis(thresholdData);
        setError(null);
      } catch (err) {
        console.error('數據獲取錯誤:', err);
        setError('數據獲取失敗，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 轉換數據為圖表格式
  const prepareAgeDistributionData = () => {
    if (!statistics?.feature_distributions) return [];
    
    const ageData = statistics.feature_distributions.age;
    return Object.entries(ageData).map(([range, count]) => ({
      range,
      count: Number(count)
    }));
  };

  const prepareVehicleAgeData = () => {
    if (!statistics?.vehicle_stats?.age_distribution) return [];
    
    return Object.entries(statistics.vehicle_stats.age_distribution).map(([age, count]) => ({
      name: age,
      value: Number(count)
    }));
  };

  const prepareVehicleDamageData = () => {
    if (!statistics?.vehicle_stats?.damage_distribution) return [];
    
    return Object.entries(statistics.vehicle_stats.damage_distribution).map(([status, count]) => ({
      name: status,
      value: Number(count)
    }));
  };

  const prepareFeatureImportanceData = () => {
    if (!featureImportance) return [];
    
    return Object.entries(featureImportance)
      .sort((a, b) => b[1] - a[1])
      .map(([feature, importance]) => ({
        feature,
        importance: Number(importance)
      }));
  };

  const prepareAgeGroupStats = () => {
    if (!statistics?.age_group_stats) return [];
    
    return statistics.age_group_stats.map(stat => ({
      group: stat.group,
      avgPremium: stat.avg_premium,
      responseRate: stat.response_rate * 100
    }));
  };

  const prepareThresholdAnalysisData = () => {
    if (!thresholdAnalysis) return [];
    return thresholdAnalysis;
  };

  // 渲染混淆矩陣
  const renderConfusionMatrix = () => {
    if (!metrics?.confusion_matrix) return null;
    
    const cm = metrics.confusion_matrix;
    const total = cm[0][0] + cm[0][1] + cm[1][0] + cm[1][1];
    
    return (
      <div className="grid grid-cols-2 gap-2 text-center font-mono">
        <div className="bg-green-100 p-4 rounded">
          <div className="text-lg font-bold">真陰性 (TN)</div>
          <div className="text-2xl">{cm[0][0]}</div>
          <div className="text-sm opacity-70">({((cm[0][0] / total) * 100).toFixed(1)}%)</div>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <div className="text-lg font-bold">假陽性 (FP)</div>
          <div className="text-2xl">{cm[0][1]}</div>
          <div className="text-sm opacity-70">({((cm[0][1] / total) * 100).toFixed(1)}%)</div>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <div className="text-lg font-bold">假陰性 (FN)</div>
          <div className="text-2xl">{cm[1][0]}</div>
          <div className="text-sm opacity-70">({((cm[1][0] / total) * 100).toFixed(1)}%)</div>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <div className="text-lg font-bold">真陽性 (TP)</div>
          <div className="text-2xl">{cm[1][1]}</div>
          <div className="text-sm opacity-70">({((cm[1][1] / total) * 100).toFixed(1)}%)</div>
        </div>
      </div>
    );
  };

  // 渲染模型指標卡片
  const renderMetricsCards = () => {
    if (!metrics) return null;
    
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">準確率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.accuracy * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">精確率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.precision * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">召回率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.recall * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">F1分數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(metrics.f1_score * 100).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-xl">{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            重新載入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">健康保險交叉銷售分析儀表板</h1>
      
      {renderMetricsCards()}

      <Tabs defaultValue="demographics" className="mt-8">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="demographics">人口統計學</TabsTrigger>
          <TabsTrigger value="vehicle">車輛分析</TabsTrigger>
          <TabsTrigger value="model">模型表現</TabsTrigger>
          <TabsTrigger value="predictions">預測分析</TabsTrigger>
        </TabsList>
        
        <TabsContent value="demographics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>年齡分佈</CardTitle>
                <CardDescription>客戶年齡分佈統計</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareAgeDistributionData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" name="客戶數量" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>各年齡段統計</CardTitle>
                <CardDescription>平均保費與響應率對比</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={prepareAgeGroupStats()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="group" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="avgPremium" stroke="#8884d8" name="平均保費" />
                    <Line yAxisId="right" type="monotone" dataKey="responseRate" stroke="#82ca9d" name="響應率 (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="vehicle">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>車輛年齡分佈</CardTitle>
                <CardDescription>客戶車輛年齡統計</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareVehicleAgeData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareVehicleAgeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>車輛損壞情況</CardTitle>
                <CardDescription>客戶車輛損壞狀態統計</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareVehicleDamageData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareVehicleDamageData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="model">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>特徵重要性</CardTitle>
                <CardDescription>各特徵對模型預測的影響程度</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={prepareFeatureImportanceData()}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="feature" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="importance" fill="#8884d8" name="重要性分數" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>混淆矩陣</CardTitle>
                <CardDescription>模型預測效果的評估</CardDescription>
              </CardHeader>
              <CardContent>
                {renderConfusionMatrix()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="predictions">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>閾值分析</CardTitle>
                <CardDescription>不同閾值下的模型評估指標</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={prepareThresholdAnalysisData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="threshold" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="precision" stroke="#8884d8" name="精確率" />
                    <Line type="monotone" dataKey="recall" stroke="#82ca9d" name="召回率" />
                    <Line type="monotone" dataKey="f1" stroke="#ffc658" name="F1分數" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard; 