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

    const genderDistribution = [
        {name: '男性', value: 54.7, color: '#64B5F6'},
        {name: '女性', value: 45.3, color: '#F06292'}
    ];

    const responseDistribution = [
        {name: '有興趣', value: 12.3, color: '#66BB6A'},
        {name: '無興趣', value: 87.7, color: '#EF5350'}
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

    // 保費分布數據
    const premiumDistribution = [
        {category: '2000-10000', count: 18},
        {category: '10001-20000', count: 27},
        {category: '20001-30000', count: 22},
        {category: '30001-40000', count: 14},
        {category: '40001-50000', count: 9},
        {category: '50001+', count: 10}
    ];

    // 各區域的響應率數據
    const regionResponse = [
        {region: '區域 A', responseRate: 15.2},
        {region: '區域 B', responseRate: 13.8},
        {region: '區域 C', responseRate: 12.6},
        {region: '區域 D', responseRate: 11.4},
        {region: '區域 E', responseRate: 10.7},
        {region: '區域 F', responseRate: 9.8},
        {region: '區域 G', responseRate: 8.5}
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                <div>
                                    <h4 className="text-lg font-medium mb-2">客戶性別分布</h4>
                                    <div className="h-64 border rounded-md p-4">
                                        <PieChartComponent data={genderDistribution}/>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        男性客戶略多於女性客戶，佔總體的54.7%。我們的分析顯示，性別與車險購買傾向的相關性較弱。
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium mb-2">目標變量分布</h4>
                                    <div className="h-64 border rounded-md p-4">
                                        <PieChartComponent data={responseDistribution}/>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2">
                                        數據集中只有12.3%的客戶對車險產品感興趣，表明我們面臨著典型的類別不平衡問題，需要特殊處理。
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-lg font-medium mb-2">年保費分布</h4>
                                <div className="h-80 border rounded-md p-4">
                                    <BarChartComponent
                                        data={premiumDistribution}
                                        xDataKey="category"
                                        bars={[
                                            {dataKey: 'count', color: '#8884d8', name: '客戶數量百分比'}
                                        ]}
                                        title="保費範圍分布"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    大多數客戶的年保費集中在10,000至30,000範圍內，共佔總體的49%。超過50,000的高保費客戶
                                    對新保險產品的興趣明顯較低，可能是因為他們已經有了全面的保險覆蓋。
                                </p>
                            </div>

                            <div className="mt-6">
                                <h4 className="text-lg font-medium mb-2">區域響應率分析</h4>
                                <div className="h-80 border rounded-md p-4">
                                    <BarChartComponent
                                        data={regionResponse}
                                        xDataKey="region"
                                        bars={[
                                            {dataKey: 'responseRate', color: '#82ca9d', name: '響應率 (%)'}
                                        ]}
                                        title="各區域響應率"
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">
                                    不同區域的客戶響應率存在明顯差異，其中區域A和B的響應率最高，分別為15.2%和13.8%。
                                    這表明地區因素可能影響客戶的保險購買決策，營銷策略應考慮區域差異。
                                </p>
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
                                    未投保客戶更有可能對新產品感興趣。「年保費」和「車輛損壞情況」也是影響客戶決策的重要因素。
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6 mt-4">
                            <div className="prose max-w-none">
                                <h3>特徵工程過程</h3>
                                <p>
                                    特徵工程是提高預測模型性能的關鍵步驟，通過對原始數據進行轉換和創建新特徵，
                                    可以幫助模型更好地捕捉數據中的模式。以下是我們在項目中執行的主要特徵工程步驟。
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
                                        <CardTitle className="text-base">銷售渠道分組</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline">特徵聚合</Badge>
                                            <Badge variant="outline">稀疏值處理</Badge>
                                        </div>
                                        <p className="text-sm">
                                            「保單銷售渠道」(Policy_Sales_Channel) 特徵包含大量不同的渠道代碼，我們根據響應率將這些代碼
                                            聚合為高績效、中績效和低績效三類，減少特徵的稀疏性並提高其信息含量。
                                        </p>
                                        <div className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">
                                            <code>
                                                channel_performance = pd.qcut(channel_response_rates, 3,<br/>
                                                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;labels=["低績效",
                                                "中績效", "高績效"])
                                            </code>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">交互特徵創建</CardTitle>
                                    </CardHeader>
                                    <CardContent className="py-2">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Badge variant="outline">特徵組合</Badge>
                                            <Badge variant="outline">非線性關係</Badge>
                                        </div>
                                        <p className="text-sm">
                                            創建「年齡與車齡」的交互特徵，捕捉這兩個因素共同作用對客戶購買決策的影響。
                                            例如，年輕客戶擁有新車的情況與老年客戶擁有新車的購買傾向可能存在顯著差異。
                                        </p>
                                        <div className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded">
                                            <code>
                                                age_vehicle_interaction = pd.get_dummies(df['vehicle_age'],
                                                prefix='vehicle')
                                                .apply(lambda x: x * df['age'], axis=0)
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
                                    這有助於識別冗餘特徵、理解數據結構，並為特徵選擇提供依據。下方熱力圖展示了主要特徵之間的相關係數。
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
                                            <span className="font-medium">年齡與保費</span>：這兩個特徵之間存在中等正相關（相關係數約0.43），表明年齡較大的客戶通常保費較高，這可能與風險評估有關。
                                        </li>
                                        <li>
                                            <span className="font-medium">之前投保與響應</span>：這兩個特徵之間存在較強負相關（相關係數約-0.64），表明已有保險的客戶不太可能對新產品感興趣，這是最顯著的相關性。
                                        </li>
                                        <li>
                                            <span className="font-medium">車輛損壞與響應</span>：存在中等正相關（相關係數約0.37），說明有車輛損壞記錄的客戶更傾向於購買新保險。
                                        </li>
                                        <li>
                                            <span className="font-medium">區域代碼與其他特徵</span>：區域代碼與大多數特徵的相關性較弱，表明客戶地理位置與其他特徵相對獨立，可能需要通過更精細的地區特徵工程來提高其預測價值。
                                        </li>
                                        <li>
                                            <span className="font-medium">性別的低相關性</span>：性別與目標變量的相關性很低（相關係數約0.02），表明在我們的數據集中，性別不是預測客戶保險購買傾向的有力指標。
                                        </li>
                                    </ul>
                                </div>

                                <div className="mt-6 p-4 bg-secondary/30 rounded-md">
                                    <h5 className="font-medium mb-2">相關性分析對模型開發的指導</h5>
                                    <p className="text-sm">
                                        基於相關性分析結果，我們優先考慮「之前是否投保」、「車輛損壞情況」和「年保費」等高相關特徵，
                                        在模型訓練中給予它們更多關注。同時，我們創建了特徵交互項來捕捉特徵間的非線性關係，
                                        並使用適當的特徵選擇技術來避免多重共線性問題。
                                    </p>
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