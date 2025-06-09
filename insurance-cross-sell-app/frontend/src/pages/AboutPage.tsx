import React from 'react';
import {PageContainer} from '@/components/layout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';

const AboutPage: React.FC = () => {
    return (
        <PageContainer
            title="關於系統"
            description="了解保險交叉銷售預測系統的詳細信息"
        >
            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>系統簡介</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>
                            保險交叉銷售預測系統是一個基於機器學習的應用程序，旨在幫助保險公司識別可能對車險產品感興趣的健康保險客戶。
                        </p>
                        <p>
                            系統使用 XGBoost 分類算法，通過分析客戶的人口統計學特徵、保險歷史和車輛相關信息來預測客戶購買車險的可能性。
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>技術堆棧</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">前端技術</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>React 18 + TypeScript</li>
                                    <li>Vite 構建工具</li>
                                    <li>React Router 路由管理</li>
                                    <li>Tailwind CSS 樣式框架</li>
                                    <li>Recharts 圖表庫</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">後端技術</h3>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Python + Flask API</li>
                                    <li>XGBoost 機器學習模型</li>
                                    <li>Pandas 數據處理</li>
                                    <li>NumPy 科學計算</li>
                                    <li>Scikit-learn 模型評估</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>系統特點</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>單一客戶預測 - 輸入單個客戶的詳細信息並獲得預測結果</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>批量預測 - 上傳含有多個客戶信息的 CSV 文件進行批量分析</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>數據分析 - 查看模型表現指標和數據統計信息</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>歷史記錄 - 保存並查看過去的預測結果</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>

                <div className="text-center text-sm text-muted-foreground">
                    <p>版本 1.0.0 | © 2025 保險交叉銷售預測系統</p>
                </div>
            </div>
        </PageContainer>
    );
};

export default AboutPage; 