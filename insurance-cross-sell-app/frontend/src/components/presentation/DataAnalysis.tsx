import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {
    PieChartComponent,
    BarChartComponent,
    LineChartComponent,
    HorizontalBarChart,
    HeatmapChart
} from '@/components/charts';
import {CorrelationMatrix} from '@/services/api';

interface DataAnalysisProps {
    className?: string;
    correlationMatrix?: CorrelationMatrix;
}

const DataAnalysis: React.FC<DataAnalysisProps> = ({className, correlationMatrix}) => {
    // 準備數據探索內容
    const ageDistribution = [
        {name: '18-25歲', value: 15, color: '#8884d8'},
        {name: '26-35歲', value: 28, color: '#82ca9d'},
        {name: '36-45歲', value: 22, color: '#ffc658'},
        {name: '46-55歲', value: 18, color: '#ff8042'},
        {name: '56歲以上', value: 17, color: '#8dd1e1'}
    ];

    const vehicleAgeDistribution = [
        {name: '不到1年', value: 32.5, color: '#8884d8'},
        {name: '1-2年', value: 51.7, color: '#82ca9d'},
        {name: '2年以上', value: 15.8, color: '#ffc658'}
    ];

    const featureImportance = [
        {name: '之前是否投保', value: 0.284},
        {name: '年保費', value: 0.176},
        {name: '車輛損壞情況', value: 0.158},
        {name: '年齡', value: 0.145},
        {name: '車齡', value: 0.092},
        {name: '保單銷售渠道', value: 0.043},
        {name: '區域代碼', value: 0.032},
        {name: '入職時間', value: 0.049},
        {name: '性別', value: 0.021}
    ];

    return (
        <div className={className}>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>數據探索與特徵工程</CardTitle>
                    <CardDescription>
                        深入分析客戶數據特徵與購買意願之間的關係
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="exploration" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="exploration">數據探索</TabsTrigger>
                            <TabsTrigger value="features">特徵工程</TabsTrigger>
                            <TabsTrigger value="correlation">特徵相關性</TabsTrigger>
                        </TabsList>

                        <TabsContent value="exploration" className="space-y-6 mt-4">
                            <div className="prose max-w-none">
                                <h3>數據概覽</h3>
                                <p>
                                    本項目使用保險公司的客戶數據集，包含38萬多條客戶記錄。數據集包含多種客戶特徵，如人口統計學信息、
                                    車輛相關信息以及保險歷史等，目標是預測客戶是否有興趣購買車險產品。
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <h4 className="text-lg font-medium mb-2">客戶年齡分布</h4>
                                    <div className="h-64 border rounded-md p-4">
                                        <PieChartComponent data={ageDistribution}/>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        26-35歲的客戶佔比最高，達到28%，這一年齡段的客戶通常正在建立事業和家庭，保險需求較高。
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium mb-2">車輛年齡分布</h4>
                                    <div className="h-64 border rounded-md p-4">
                                        <PieChartComponent data={vehicleAgeDistribution}/>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        大多數客戶的車輛年齡在1-2年之間，這類車輛通常已經過了廠家保修期，車主更有可能購買額外保險。
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-lg font-medium mb-2">特徵重要性分析</h4>
                                <div className="h-80 border rounded-md p-4">
                                    <HorizontalBarChart
                                        data={featureImportance}
                                        dataKey="value"
                                        nameKey="name"
                                        color="#8884d8"
                                        height={280}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    「之前是否投保」是最重要的特徵，這表明客戶的保險歷史對其購買新保險產品的傾向有顯著影響。
                                    未投保客戶更有可能對新產品感興趣。
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6 mt-4">
                            <div className="prose max-w-none">
                                <h3>特徵工程過程</h3>
                                <p>
                                    特徵工程是提高預測模型性能的關鍵步驟，通過對原始數據進行轉換和創建新特徵，
                                    可以幫助模型更好地捕捉數據中的模式。
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">年保費對數轉換</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline">特徵創建</Badge>
                                            <Badge variant="outline">數值轉換</Badge>
                                        </div>
                                        <p className="text-sm">
                                            對「年保費」(Annual_Premium) 特徵進行對數轉換，創建 annual_premium_log 特徵。
                                            這種轉換可以減小數值範圍，使得模型更穩定，同時保留原始數據的分佈特性。
                                        </p>
                                        <div className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">
                                            <code>annual_premium_log = np.log1p(Annual_Premium)</code>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">年齡分組</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline">類別轉換</Badge>
                                            <Badge variant="outline">分組聚合</Badge>
                                        </div>
                                        <p className="text-sm">
                                            將連續的「年齡」(Age) 特徵轉換為類別型特徵
                                            age_group，根據人生階段將客戶分為青年、中年、中老年和老年四組。
                                            這種分組可以捕捉不同年齡段客戶的購買行為模式。
                                        </p>
                                        <div className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">
                                            <code>
                                                age_group = "青年" if age &lt; 25 else<br/>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"中年"
                                                if age &lt; 40 else<br/>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"中老年"
                                                if age &lt; 60 else "老年"
                                            </code>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">特徵名稱標準化</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline">數據清洗</Badge>
                                            <Badge variant="outline">命名規範</Badge>
                                        </div>
                                        <p className="text-sm">
                                            將所有特徵名稱轉換為小寫並使用下劃線分隔，確保命名的一致性和規範性，
                                            便於後續模型開發和部署。
                                        </p>
                                        <div className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">
                                            <code>
                                                columns = [col.lower().replace(' ', '_') for col in df.columns]
                                            </code>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="correlation" className="space-y-6 mt-4">
                            <div className="prose max-w-none">
                                <h3>特徵相關性分析</h3>
                                <p>
                                    通過計算特徵之間的相關性，我們可以了解特徵間的關係強度和方向，
                                    這有助於識別冗餘特徵、理解數據結構，並為特徵選擇提供依據。
                                </p>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-lg font-medium mb-4">特徵相關性熱力圖</h4>
                                <div className="border rounded-md p-4 flex justify-center">
                                    {correlationMatrix ? (
                                        <HeatmapChart
                                            data={correlationMatrix}
                                            height={480}
                                            width={640}
                                        />
                                    ) : (
                                        <div className="h-80 flex items-center justify-center">
                                            <p className="text-muted-foreground">相關性矩陣數據加載中或不可用...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 space-y-2">
                                    <h5 className="font-medium">關鍵發現</h5>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>
                                            <span className="font-medium">年齡與保費</span>：這兩個特徵之間存在中等正相關，表明年齡較大的客戶通常保費較高。
                                        </li>
                                        <li>
                                            <span className="font-medium">之前投保與響應</span>：這兩個特徵之間存在負相關，表明已有保險的客戶不太可能對新產品感興趣。
                                        </li>
                                        <li>
                                            <span className="font-medium">車輛損壞與響應</span>：存在正相關，說明有車輛損壞記錄的客戶更傾向於購買新保險。
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default DataAnalysis; 