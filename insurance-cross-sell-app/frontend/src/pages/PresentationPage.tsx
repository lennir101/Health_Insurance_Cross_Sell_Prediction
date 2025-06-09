import React, {useState, useEffect} from 'react';
import {PageContainer} from '@/components/layout';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';

// 引入展示組件
import DataAnalysis from '@/components/presentation/DataAnalysis';
import ModelExplanation from '@/components/presentation/ModelExplanation';
import ParameterExploration from '@/components/presentation/ParameterExploration';
import InteractiveModelDemo from '@/components/presentation/InteractiveModelDemo';
import ApiService from '@/services/api';
import {CorrelationMatrix} from '@/services/api';

const PresentationPage: React.FC = () => {
    // 用於存儲相關性矩陣數據
    const [correlationMatrix, setCorrelationMatrix] = useState<CorrelationMatrix | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);

    // 獲取相關性矩陣數據
    useEffect(() => {
        const fetchCorrelationMatrix = async () => {
            try {
                setLoading(true);
                const response = await ApiService.getCorrelationMatrix();
                if (response.status === 200) {
                    setCorrelationMatrix(response.data);
                } else {
                    console.error('獲取相關性矩陣失敗:', response.message);
                }
            } catch (error) {
                console.error('API請求出錯:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCorrelationMatrix();
    }, []);

    return (
        <PageContainer
            title="保險交叉銷售預測項目演示"
            description="交互式展示與講解項目背景、實現原理和應用場景"
        >
            <Tabs defaultValue="intro" className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full">
                    <TabsTrigger value="intro">項目背景</TabsTrigger>
                    <TabsTrigger value="data">數據分析</TabsTrigger>
                    <TabsTrigger value="model">模型原理</TabsTrigger>
                    <TabsTrigger value="tuning">模型優化</TabsTrigger>
                    <TabsTrigger value="demo">互動演示</TabsTrigger>
                </TabsList>

                {/* 項目背景部分 */}
                <TabsContent value="intro" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>項目背景與商業價值</CardTitle>
                            <CardDescription>
                                了解保險交叉銷售預測的商業背景與價值
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-lg font-medium">保險交叉銷售預測 - 商業場景</p>
                            <div className="prose max-w-none">
                                <p>
                                    保險公司希望向其現有客戶交叉銷售車輛保險產品。公司已經收集了客戶的相關資訊，包括人口統計信息、車輛保險狀況等，
                                    並希望建立一個預測模型來識別哪些客戶最有可能對新產品感興趣。
                                </p>
                                <h3>商業問題</h3>
                                <ul>
                                    <li>如何有效識別對車險產品有興趣的客戶？</li>
                                    <li>如何優化市場營銷資源，專注於高轉化率客戶？</li>
                                    <li>如何提高交叉銷售的成功率？</li>
                                </ul>
                                <h3>商業價值</h3>
                                <ul>
                                    <li>降低客戶獲取成本</li>
                                    <li>提高市場營銷效率</li>
                                    <li>增加保險產品的滲透率</li>
                                    <li>提升客戶終身價值</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 數據分析部分 */}
                <TabsContent value="data" className="space-y-4">
                    {loading ? (
                        <Card>
                            <CardContent className="flex items-center justify-center p-8">
                                <div className="text-center">
                                    <div
                                        className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                                    <p className="mt-4 text-muted-foreground">正在載入數據分析結果...</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <DataAnalysis correlationMatrix={correlationMatrix}/>
                    )}
                </TabsContent>

                {/* 模型原理部分 */}
                <TabsContent value="model" className="space-y-4">
                    <ModelExplanation/>
                </TabsContent>

                {/* 模型優化部分 */}
                <TabsContent value="tuning" className="space-y-4">
                    <ParameterExploration/>
                </TabsContent>

                {/* 互動演示部分 */}
                <TabsContent value="demo" className="space-y-4">
                    <InteractiveModelDemo/>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
};

export default PresentationPage; 