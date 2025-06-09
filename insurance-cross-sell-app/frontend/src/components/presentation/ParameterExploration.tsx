import React, {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Slider} from '@/components/ui/slider';
import {Progress} from '@/components/ui/progress';
import {Button} from '@/components/ui/button';
import {LineChartComponent} from '@/components/charts';

interface ParameterExplorationProps {
    className?: string;
}

const ParameterExploration: React.FC<ParameterExplorationProps> = ({className}) => {
    const [selectedParam, setSelectedParam] = useState<string>('learning_rate');
    const [paramValue, setParamValue] = useState<number>(0.1);

    // 模擬參數調整後的F1分數變化
    const parameterImpacts = {
        learning_rate: {
            description: '學習率控制模型學習的速度，較低的值通常能提高精確度但訓練時間更長。',
            values: [0.01, 0.03, 0.05, 0.07, 0.1, 0.15, 0.2, 0.3],
            f1_scores: [0.73, 0.76, 0.79, 0.81, 0.83, 0.82, 0.80, 0.77],
            optimal: 0.1,
            range: [0.01, 0.3]
        },
        max_depth: {
            description: '樹的最大深度，較深的樹可以捕捉更複雜的關係，但也更容易過擬合。',
            values: [3, 4, 5, 6, 7, 8, 9, 10],
            f1_scores: [0.76, 0.79, 0.81, 0.83, 0.84, 0.83, 0.82, 0.81],
            optimal: 7,
            range: [3, 10]
        },
        subsample: {
            description: '每次迭代使用的訓練數據比例，適當的子採樣可以防止過擬合並提高訓練速度。',
            values: [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95],
            f1_scores: [0.77, 0.79, 0.81, 0.82, 0.84, 0.83, 0.82, 0.81],
            optimal: 0.8,
            range: [0.6, 0.95]
        },
        scale_pos_weight: {
            description: '正樣本的權重，在標籤不平衡問題中調整此參數可以提高少數類預測性能。',
            values: [1.0, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5],
            f1_scores: [0.78, 0.80, 0.82, 0.83, 0.85, 0.84, 0.82, 0.80],
            optimal: 1.8,
            range: [1.0, 2.5]
        }
    };

    // 處理參數值改變
    const handleParamChange = (value: number[]) => {
        setParamValue(value[0]);
    };

    // 準備圖表數據
    const prepareChartData = (param: string) => {
        const paramData = parameterImpacts[param as keyof typeof parameterImpacts];
        return paramData.values.map((value, index) => ({
            paramValue: value,
            f1Score: paramData.f1_scores[index]
        }));
    };

    // 獲取當前選擇的參數數據
    const currentParamData = parameterImpacts[selectedParam as keyof typeof parameterImpacts];

    // 計算當前參數值對應的預測F1分數（線性插值）
    const calculateCurrentF1 = () => {
        const {values, f1_scores, range} = currentParamData;

        // 如果值匹配現有數據點，直接返回
        const exactIndex = values.findIndex(v => v === paramValue);
        if (exactIndex !== -1) {
            return f1_scores[exactIndex];
        }

        // 否則進行線性插值
        const index = values.findIndex(v => v > paramValue);
        if (index === 0) return f1_scores[0]; // 小於最小值
        if (index === -1) return f1_scores[f1_scores.length - 1]; // 大於最大值

        const lowerValue = values[index - 1];
        const upperValue = values[index];
        const lowerF1 = f1_scores[index - 1];
        const upperF1 = f1_scores[index];

        // 線性插值計算
        const ratio = (paramValue - lowerValue) / (upperValue - lowerValue);
        return lowerF1 + ratio * (upperF1 - lowerF1);
    };

    // 設置參數到最優值
    const setOptimalValue = () => {
        setParamValue(currentParamData.optimal);
    };

    // 根據當前F1分數計算進度條值
    const progressValue = (calculateCurrentF1() / 0.85) * 100;

    return (
        <div className={className}>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>超參數調優探索</CardTitle>
                    <CardDescription>
                        了解關鍵參數如何影響模型性能，互動式探索不同參數組合
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Tabs
                        defaultValue="learning_rate"
                        className="w-full"
                        onValueChange={setSelectedParam}
                        value={selectedParam}
                    >
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="learning_rate">學習率</TabsTrigger>
                            <TabsTrigger value="max_depth">樹深度</TabsTrigger>
                            <TabsTrigger value="subsample">子採樣率</TabsTrigger>
                            <TabsTrigger value="scale_pos_weight">正樣本權重</TabsTrigger>
                        </TabsList>

                        {Object.keys(parameterImpacts).map(param => (
                            <TabsContent key={param} value={param} className="space-y-6 mt-4">
                                <div>
                                    <h3 className="text-lg font-medium mb-2">
                                        {param === 'learning_rate' && '學習率 (Learning Rate)'}
                                        {param === 'max_depth' && '樹深度 (Max Depth)'}
                                        {param === 'subsample' && '子採樣率 (Subsample)'}
                                        {param === 'scale_pos_weight' && '正樣本權重 (Scale Pos Weight)'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {parameterImpacts[param as keyof typeof parameterImpacts].description}
                                    </p>

                                    <div className="h-80 border rounded-md p-4 mb-6">
                                        <LineChartComponent
                                            data={prepareChartData(param)}
                                            xDataKey="paramValue"
                                            lines={[{dataKey: 'f1Score', color: '#8884d8', name: 'F1分數'}]}
                                            height={300}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">參數值: {paramValue}</h4>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={setOptimalValue}
                                            >
                                                設置為最優值
                                            </Button>
                                        </div>

                                        <Slider
                                            value={[paramValue]}
                                            min={currentParamData.range[0]}
                                            max={currentParamData.range[1]}
                                            step={param === 'max_depth' ? 1 : 0.01}
                                            onValueChange={handleParamChange}
                                            className="my-4"
                                        />

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className="text-sm font-medium">預測F1分數: {calculateCurrentF1().toFixed(4)}</span>
                                                <span
                                                    className="text-sm text-muted-foreground">最佳值: {Math.max(...currentParamData.f1_scores).toFixed(4)}</span>
                                            </div>
                                            <Progress value={progressValue} className="h-2"/>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 mt-4 p-4 bg-secondary/30 rounded-md">
                                    <h4 className="font-medium">調優心得</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {param === 'learning_rate' && (
                                            <>
                                                <li>較低的學習率（0.05-0.1）產生最好的結果，表明模型需要較小的步長來準確擬合數據</li>
                                                <li>過高的學習率（&gt;0.2）導致模型不穩定，可能錯過最優解</li>
                                                <li>最佳學習率設置為0.1，平衡了訓練速度和預測準確性</li>
                                            </>
                                        )}
                                        {param === 'max_depth' && (
                                            <>
                                                <li>最佳樹深度為7，提供了足夠的複雜度來捕捉特徵關係</li>
                                                <li>樹深度超過8時F1分數開始下降，表明模型開始過擬合</li>
                                                <li>樹深度小於5時，模型無法捕捉數據中的重要模式</li>
                                            </>
                                        )}
                                        {param === 'subsample' && (
                                            <>
                                                <li>最佳子採樣率為0.8，表明使用80%的訓練數據效果最好</li>
                                                <li>較低的子採樣率（&lt;0.7）導致模型未充分學習，降低預測性能</li>
                                                <li>接近1的子採樣率增加過擬合風險，尤其是在大量迭代的情況下</li>
                                            </>
                                        )}
                                        {param === 'scale_pos_weight' && (
                                            <>
                                                <li>最佳正樣本權重為1.8，有效平衡了正負樣本的不平衡</li>
                                                <li>較低的值（&lt;1.5）導致模型傾向於預測負例，召回率較低</li>
                                                <li>過高的值（&gt;2.2）雖然提高了召回率，但導致更多假陽性，降低了整體F1分數</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ParameterExploration; 