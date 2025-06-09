import React, {useState} from 'react';
import {PageContainer} from '@/components/layout';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';

const PresentationPage: React.FC = () => {
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
                    <Card>
                        <CardHeader>
                            <CardTitle>數據探索與特徵工程</CardTitle>
                            <CardDescription>
                                深入理解數據特徵與目標變量的關係
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>數據分析部分的內容將在這裡展示</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 模型原理部分 */}
                <TabsContent value="model" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>機器學習模型原理</CardTitle>
                            <CardDescription>
                                理解XGBoost、隨機森林等算法在保險預測中的應用
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>模型原理部分的內容將在這裡展示</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 模型優化部分 */}
                <TabsContent value="tuning" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>參數調優與模型優化</CardTitle>
                            <CardDescription>
                                了解如何通過超參數調優提升模型性能
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>模型優化部分的內容將在這裡展示</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 互動演示部分 */}
                <TabsContent value="demo" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>交互式模型演示</CardTitle>
                            <CardDescription>
                                親身體驗預測模型的工作原理
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>互動演示部分的內容將在這裡展示</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </PageContainer>
    );
};

export default PresentationPage; 