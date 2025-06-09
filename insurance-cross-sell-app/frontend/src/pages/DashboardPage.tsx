import React, {useEffect, useState} from 'react';
import {PageContainer} from '@/components/layout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Separator} from '@/components/ui/separator';
import {
    PieChartComponent,
    BarChartComponent,
    LineChartComponent,
    HorizontalBarChart,
    D3GaugeChart,
    D3BubbleChart,
    D3AreaChart,
    HeatmapChart
} from '@/components/charts';
import {
    prepareVehicleAgeData,
    prepareVehicleDamageData,
    prepareGenderDistributionData,
    prepareAgeDistributionData,
    preparePredictionDistributionData,
    prepareMonthlyPredictionData,
    prepareFeatureImportanceData
} from '@/utils/chartUtils';
import ApiService, {DataStats, ModelMetrics, CorrelationMatrix} from '@/services/api';
import {chartColors} from '@/lib/themes';

const DashboardPage: React.FC = () => {
    const [dataStats, setDataStats] = useState<DataStats | null>(null);
    const [modelMetrics, setModelMetrics] = useState<ModelMetrics | null>(null);
    const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 獲取數據統計信息
                const dataStatsResponse = await ApiService.getDataStats();
                if (dataStatsResponse.status === 200) {
                    setDataStats(dataStatsResponse.data);
                } else {
                    setError(`獲取數據統計失敗: ${dataStatsResponse.message || '未知錯誤'}`);
                    console.error('數據統計回應:', dataStatsResponse);
                }

                // 獲取模型指標
                const modelMetricsResponse = await ApiService.getModelMetrics();
                if (modelMetricsResponse.status === 200) {
                    setModelMetrics(modelMetricsResponse.data);
                } else {
                    setError(`獲取模型指標失敗: ${modelMetricsResponse.message || '未知錯誤'}`);
                    console.error('模型指標回應:', modelMetricsResponse);
                }

                // 獲取相關性矩陣
                const correlationResponse = await ApiService.getCorrelationMatrix();
                if (correlationResponse.status === 200) {
                    setCorrelationMatrix(correlationResponse.data);
                } else {
                    console.error('相關性矩陣回應:', correlationResponse);
                }
            } catch (err: any) {
                setError(`載入數據時發生錯誤: ${err.message || '未知網絡錯誤'}`);
                console.error('載入錯誤:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 模擬歷史預測數據
    const predictionsHistory = [
        {date: new Date('2025-01-01'), value: 120},
        {date: new Date('2025-02-01'), value: 150},
        {date: new Date('2025-03-01'), value: 200},
        {date: new Date('2025-04-01'), value: 180},
        {date: new Date('2025-05-01'), value: 250},
        {date: new Date('2025-06-01'), value: 300}
    ];

    // 轉換數據為D3BubbleChart格式
    const getBubbleData = () => {
        if (!dataStats?.features_stats) return [];

        const result = [];
        const features = dataStats.features_stats;

        // 提取特徵統計數據
        if (features.gender) {
            result.push(
                {id: 'gender-male', name: '男性', value: features.gender.Male || 0, group: '性別'},
                {id: 'gender-female', name: '女性', value: features.gender.Female || 0, group: '性別'}
            );
        }

        if (features.vehicle_age) {
            Object.entries(features.vehicle_age).forEach(([key, value]) => {
                result.push({
                    id: `vehicle-age-${key}`,
                    name: key,
                    value: value as number,
                    group: '車輛年齡'
                });
            });
        }

        if (features.vehicle_damage) {
            Object.entries(features.vehicle_damage).forEach(([key, value]) => {
                result.push({
                    id: `vehicle-damage-${key}`,
                    name: key === 'Yes' ? '已損壞' : '未損壞',
                    value: value as number,
                    group: '車輛損壞'
                });
            });
        }

        if (features.previously_insured) {
            Object.entries(features.previously_insured).forEach(([key, value]) => {
                result.push({
                    id: `previously-insured-${key}`,
                    name: key === '1' ? '已投保' : '未投保',
                    value: value as number,
                    group: '曾經投保'
                });
            });
        }

        return result;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-50 p-6 rounded-lg shadow-md">
                    <h2 className="text-red-600 text-xl font-medium mb-2">載入失敗</h2>
                    <p className="text-gray-700">{error}</p>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        重試
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PageContainer
            title="數據儀表板"
            description="查看保險客戶數據統計和模型表現指標"
        >
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">概覽</TabsTrigger>
                    <TabsTrigger value="metrics">模型指標</TabsTrigger>
                    <TabsTrigger value="features">特徵重要性</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">總記錄數</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="text-2xl font-bold">{dataStats?.total_records.toLocaleString() || 0}</div>
                                <p className="text-xs text-muted-foreground">客戶記錄總數</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">模型準確率</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="text-2xl font-bold">{((modelMetrics?.accuracy || 0) * 100).toFixed(2)}%
                                </div>
                                <p className="text-xs text-muted-foreground">模型預測準確度</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">AUC-ROC</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{modelMetrics?.auc_roc.toFixed(3) || 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">曲線下面積</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">閾值</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{modelMetrics ? '0.35' : 'N/A'}</div>
                                <p className="text-xs text-muted-foreground">預測決策閾值</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>數據分布</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <PieChartComponent
                                            data={prepareVehicleAgeData()}
                                            title="車輛年齡分布"
                                        />
                                    </div>
                                    <div>
                                        <PieChartComponent
                                            data={prepareVehicleDamageData()}
                                            title="車輛損壞狀況"
                                        />
                                    </div>
                                    <div>
                                        <PieChartComponent
                                            data={prepareGenderDistributionData()}
                                            title="性別分布"
                                        />
                                    </div>
                                    <div>
                                        <PieChartComponent
                                            data={prepareAgeDistributionData()}
                                            title="年齡分布"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>預測結果分布</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PieChartComponent
                                    data={preparePredictionDistributionData()}
                                    height={240}
                                />
                                <p className="text-sm text-muted-foreground mt-4 text-center">
                                    預測興趣程度分布
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>月度預測趨勢</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LineChartComponent
                                data={prepareMonthlyPredictionData()}
                                xDataKey="name"
                                lines={[
                                    {dataKey: 'positive', color: '#82ca9d', name: '有興趣'},
                                    {dataKey: 'negative', color: '#8884d8', name: '無興趣'}
                                ]}
                                height={300}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>模型評估指標</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="font-medium mb-2">混淆矩陣</h3>
                                    <div className="p-4 border rounded-md">
                                        <table className="w-full text-center">
                                            <thead>
                                            <tr>
                                                <th className="p-2 border"></th>
                                                <th className="p-2 border">預測負例</th>
                                                <th className="p-2 border">預測正例</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <th className="p-2 border">實際負例</th>
                                                <td className="p-2 border bg-green-100">{modelMetrics?.confusion_matrix[0][0] || 'N/A'}</td>
                                                <td className="p-2 border bg-red-100">{modelMetrics?.confusion_matrix[0][1] || 'N/A'}</td>
                                            </tr>
                                            <tr>
                                                <th className="p-2 border">實際正例</th>
                                                <td className="p-2 border bg-red-100">{modelMetrics?.confusion_matrix[1][0] || 'N/A'}</td>
                                                <td className="p-2 border bg-green-100">{modelMetrics?.confusion_matrix[1][1] || 'N/A'}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-2">性能指標</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">準確率</span>
                                            <span>{((modelMetrics?.accuracy || 0) * 100).toFixed(2)}%</span>
                                        </div>
                                        <Separator/>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">精確率</span>
                                            <span>{((modelMetrics?.precision || 0) * 100).toFixed(2)}%</span>
                                        </div>
                                        <Separator/>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">召回率</span>
                                            <span>{((modelMetrics?.recall || 0) * 100).toFixed(2)}%</span>
                                        </div>
                                        <Separator/>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">F1分數</span>
                                            <span>{((modelMetrics?.f1_score || 0) * 100).toFixed(2)}%</span>
                                        </div>
                                        <Separator/>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">AUC-ROC</span>
                                            <span>{modelMetrics?.auc_roc?.toFixed(3) || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-medium mb-2">ROC曲線</h3>
                                <div className="p-4 border rounded-md flex justify-center">
                                    <img
                                        src="/images/roc_curve.svg"
                                        alt="ROC曲線"
                                        className="h-48"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect width="100%25" height="100%25" fill="%23f5f5f5"/%3E%3Cpath d="M0,180 L320,0" stroke="%23ddd" stroke-width="2" stroke-dasharray="5,5"/%3E%3Cpath d="M0,180 C80,160 150,120 225,50 Q260,20 320,0" stroke="%238884d8" stroke-width="3" fill="none"/%3E%3Ctext x="160" y="90" font-family="sans-serif" font-size="12" text-anchor="middle"%3EROC 曲線 (AUC = 0.856)%3C/text%3E%3C/svg%3E';
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>特徵重要性</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                下圖顯示了各特徵對模型預測結果的重要性排名。
                            </p>
                            <HorizontalBarChart
                                data={prepareFeatureImportanceData()}
                                dataKey="value"
                                nameKey="name"
                                color="#8884d8"
                                height={350}
                            />
                        </CardContent>
                    </Card>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>特徵相關性</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {correlationMatrix ? (
                                    <HeatmapChart
                                        data={correlationMatrix}
                                        height={400}
                                        width={560}
                                        className="mx-auto"
                                    />
                                ) : (
                                    <div
                                        className="h-48 flex items-center justify-center border rounded-md bg-slate-50">
                                        <p className="text-sm text-slate-500">
                                            {loading ? '載入相關性矩陣中...' : '無法載入相關性矩陣數據'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>特徵分析</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        模型預測中最重要的三個特徵:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>
                                            <span className="font-medium">年齡</span> - 客戶年齡是最重要的預測因素，中年客戶更可能購買車險
                                        </li>
                                        <li>
                                            <span className="font-medium">年保費</span> - 保費金額與購買意願呈正相關
                                        </li>
                                        <li>
                                            <span className="font-medium">車齡</span> - 較新車輛的客戶更傾向於購買額外保險
                                        </li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
};

export default DashboardPage; 