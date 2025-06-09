import React, {useState} from 'react';
import {PageContainer} from '@/components/layout';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {PieChartComponent} from '@/components/charts';

const PredictionPage: React.FC = () => {
    const [formData, setFormData] = useState({
        gender: 'male',
        age: 35,
        drivingLicense: 1,
        regionCode: 28,
        previouslyInsured: 0,
        vehicleAge: '1-2 Years',
        vehicleDamage: 'Yes',
        annualPremium: 30000,
        policyChannel: 152,
        vintage: 217
    });

    const [prediction, setPrediction] = useState<{
        probability: number;
        prediction: number;
    } | null>(null);

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target as HTMLInputElement;

        // 對於數字類型的輸入，轉換為數字
        if (type === 'number') {
            setFormData({
                ...formData,
                [name]: parseFloat(value)
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // 模擬 API 請求
        setTimeout(() => {
            // 隨機生成概率值 (0.1 ~ 0.9)
            const probability = Math.random() * 0.8 + 0.1;
            const prediction = probability > 0.5 ? 1 : 0;

            setPrediction({
                probability,
                prediction
            });

            setLoading(false);
        }, 1500);
    };

    const renderPredictionResult = () => {
        if (!prediction) return null;

        const probabilityPercent = (prediction.probability * 100).toFixed(2);
        const isPredictionPositive = prediction.prediction === 1;

        const chartData = [
            {name: '購買意願', value: parseFloat(probabilityPercent), color: '#8884d8'},
            {name: '無意願', value: 100 - parseFloat(probabilityPercent), color: '#82ca9d'}
        ];

        return (
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>預測結果</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center">
                            <PieChartComponent data={chartData} height={240}/>
                            <p className="text-center mt-2 text-sm text-muted-foreground">
                                購買車險可能性分布
                            </p>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div
                                className={`text-center p-4 rounded-lg mb-4 ${isPredictionPositive ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                <p className="text-lg font-medium mb-2">預測結果</p>
                                <p className="text-3xl font-bold">
                                    {isPredictionPositive ? '有意願購買' : '無意願購買'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    購買可能性: {probabilityPercent}%
                                </p>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium">客戶特徵分析:</p>
                                <ul className="list-disc pl-5 space-y-1 text-sm">
                                    <li>客戶年齡 ({formData.age}) 處於較為活躍的保險購買區間</li>
                                    <li>客戶地區碼 ({formData.regionCode}) 對購買決策有中等影響</li>
                                    <li>車輛年齡 ({formData.vehicleAge}) 是關鍵因素之一</li>
                                    <li>之前{formData.previouslyInsured ? '已' : '未'}購買保險的歷史也很重要</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <PageContainer
            title="單一客戶預測"
            description="輸入客戶資料，獲取車險購買可能性預測"
        >
            <div className="flex flex-col gap-6">
                <p className="text-lg">
                    請輸入客戶信息以獲得預測結果。系統將分析客戶是否有興趣購買車險。
                </p>

                <Card>
                    <CardHeader>
                        <CardTitle>客戶資料</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">性別</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="male">男性</option>
                                        <option value="female">女性</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">年齡</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        min="18"
                                        max="100"
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">駕照</label>
                                    <select
                                        name="drivingLicense"
                                        value={formData.drivingLicense}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="1">有</option>
                                        <option value="0">無</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">區域碼</label>
                                    <input
                                        type="number"
                                        name="regionCode"
                                        value={formData.regionCode}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">之前投保</label>
                                    <select
                                        name="previouslyInsured"
                                        value={formData.previouslyInsured}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="0">無</option>
                                        <option value="1">有</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">車齡</label>
                                    <select
                                        name="vehicleAge"
                                        value={formData.vehicleAge}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="< 1 Year">1年以下</option>
                                        <option value="1-2 Years">1-2年</option>
                                        <option value="> 2 Years">2年以上</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">車輛損壞</label>
                                    <select
                                        name="vehicleDamage"
                                        value={formData.vehicleDamage}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    >
                                        <option value="Yes">有</option>
                                        <option value="No">無</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">年保費</label>
                                    <input
                                        type="number"
                                        name="annualPremium"
                                        value={formData.annualPremium}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">銷售渠道</label>
                                    <input
                                        type="number"
                                        name="policyChannel"
                                        value={formData.policyChannel}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">客戶資歷 (天)</label>
                                    <input
                                        type="number"
                                        name="vintage"
                                        value={formData.vintage}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? '預測中...' : '進行預測'}
                                </button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {renderPredictionResult()}
            </div>
        </PageContainer>
    );
};

export default PredictionPage; 