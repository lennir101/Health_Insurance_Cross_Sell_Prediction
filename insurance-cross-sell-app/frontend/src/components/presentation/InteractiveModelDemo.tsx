import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import ApiService from '@/services/api';

interface InteractiveModelDemoProps {
    className?: string;
}

const InteractiveModelDemo: React.FC<InteractiveModelDemoProps> = ({className}) => {
    // 客戶特徵狀態
    const [customerFeatures, setCustomerFeatures] = useState({
        gender: 'Male',
        age: 35,
        driving_license: 1,
        region_code: 28.0,
        previously_insured: 0,
        vehicle_age: '1-2 Year',
        vehicle_damage: 'Yes',
        annual_premium: 30000,
        policy_sales_channel: 152.0,
        vintage: 100
    });

    // 預測結果狀態
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // 特徵重要性的顯示狀態
    const [showImportance, setShowImportance] = useState(false);

    // 根據特徵值的變化更新預測
    const handleFeatureChange = (feature: string, value: any) => {
        setCustomerFeatures(prev => ({
            ...prev,
            [feature]: value
        }));
    };

    // 執行預測
    const handlePredict = async () => {
        setLoading(true);
        try {
            const response = await ApiService.submitPrediction(customerFeatures);
            if (response.status === 200) {
                setPrediction(response.data);
            } else {
                console.error('預測失敗:', response.message);
            }
        } catch (error) {
            console.error('預測請求出錯:', error);
        } finally {
            setLoading(false);
        }
    };

    // 特徵重要性柱狀圖顯示
    const renderFeatureImportance = () => {
        if (!prediction || !prediction.features_importance) return null;

        const importanceEntries = Object.entries(prediction.features_importance)
            .map(([key, value]) => ({name: key, value: value as number}))
            .sort((a, b) => b.value - a.value);

        return (
            <div className="mt-4">
                <h3 className="text-lg font-medium mb-2">特徵對本次預測的影響</h3>
                <div className="space-y-2">
                    {importanceEntries.map(({name, value}) => (
                        <div key={name} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{name}</span>
                                <span className="text-sm text-gray-500">{(value * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={value * 100} className="h-2"/>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={className}>
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>互動式模型體驗</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* 客戶基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="gender">性別</Label>
                            <Select
                                value={customerFeatures.gender}
                                onValueChange={(value) => handleFeatureChange('gender', value)}
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="選擇性別"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">男性</SelectItem>
                                    <SelectItem value="Female">女性</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age">年齡: {customerFeatures.age}</Label>
                            <Slider
                                id="age"
                                min={18}
                                max={80}
                                step={1}
                                value={[customerFeatures.age]}
                                onValueChange={(value) => handleFeatureChange('age', value[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="previously_insured">已投保狀態</Label>
                            <Select
                                value={customerFeatures.previously_insured.toString()}
                                onValueChange={(value) => handleFeatureChange('previously_insured', parseInt(value))}
                            >
                                <SelectTrigger id="previously_insured">
                                    <SelectValue placeholder="選擇投保狀態"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">未投保</SelectItem>
                                    <SelectItem value="1">已投保</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicle_age">車輛年齡</Label>
                            <Select
                                value={customerFeatures.vehicle_age}
                                onValueChange={(value) => handleFeatureChange('vehicle_age', value)}
                            >
                                <SelectTrigger id="vehicle_age">
                                    <SelectValue placeholder="選擇車輛年齡"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="< 1 Year">不到1年</SelectItem>
                                    <SelectItem value="1-2 Year">1-2年</SelectItem>
                                    <SelectItem value="> 2 Years">2年以上</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="vehicle_damage">車輛損壞狀況</Label>
                            <Select
                                value={customerFeatures.vehicle_damage}
                                onValueChange={(value) => handleFeatureChange('vehicle_damage', value)}
                            >
                                <SelectTrigger id="vehicle_damage">
                                    <SelectValue placeholder="選擇損壞狀況"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes">有損壞記錄</SelectItem>
                                    <SelectItem value="No">無損壞記錄</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="annual_premium">年保費:
                                ¥{customerFeatures.annual_premium.toLocaleString()}</Label>
                            <Slider
                                id="annual_premium"
                                min={2000}
                                max={100000}
                                step={1000}
                                value={[customerFeatures.annual_premium]}
                                onValueChange={(value) => handleFeatureChange('annual_premium', value[0])}
                            />
                        </div>
                    </div>

                    {/* 預測按鈕 */}
                    <div className="flex justify-center pt-4">
                        <Button
                            onClick={handlePredict}
                            disabled={loading}
                            className="w-full md:w-auto"
                        >
                            {loading ? '預測中...' : '執行預測'}
                        </Button>
                    </div>

                    {/* 預測結果 */}
                    {prediction && (
                        <div className="mt-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">預測結果</h3>
                                <Button variant="outline" onClick={() => setShowImportance(!showImportance)}>
                                    {showImportance ? '隱藏特徵影響' : '顯示特徵影響'}
                                </Button>
                            </div>
                            <Card className={prediction.prediction === 1 ? 'bg-green-50' : 'bg-blue-50'}>
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <h4 className="text-xl font-bold mb-2">
                                            {prediction.prediction === 1 ? '客戶可能對車險感興趣' : '客戶可能對車險不感興趣'}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            預測置信度: {(prediction.probability * 100).toFixed(1)}%
                                        </p>
                                        <div className="mt-4">
                                            <Progress value={prediction.probability * 100} className="h-3"/>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* 條件顯示特徵重要性 */}
                            {showImportance && renderFeatureImportance()}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="text-sm text-gray-500 flex justify-center">
                    調整客戶特徵，觀察對預測結果的影響
                </CardFooter>
            </Card>
        </div>
    );
};

export default InteractiveModelDemo; 