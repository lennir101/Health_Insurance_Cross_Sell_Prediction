import React, {useState} from 'react';
import predictionService, {CustomerData, PredictionResult} from '../services/predictionService';

const Prediction: React.FC = () => {
    const [formData, setFormData] = useState<CustomerData>({
        gender: 'Male',
        age: 35,
        driving_license: 1,
        region_code: 28,
        previously_insured: 0,
        vehicle_age: '1-2 Year',
        vehicle_damage: 'Yes',
        annual_premium: 35000,
        policy_sales_channel: 152,
        vintage: 90
    });

    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target as HTMLInputElement;

        // 將數值型輸入轉換為數字
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
        setError(null);

        try {
            const result = await predictionService.predictSingle(formData);
            setPrediction(result);
        } catch (err) {
            console.error('預測請求錯誤:', err);
            setError('無法完成預測，請稍後再試');
        } finally {
            setLoading(false);
        }
    };

    const getPredictionClass = () => {
        if (!prediction) return '';
        return prediction.probability > prediction.threshold
            ? 'bg-green-100 border-green-500'
            : 'bg-red-100 border-red-500';
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">健康保險交叉銷售預測</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-6">客戶信息輸入</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">性別</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Male">男性</option>
                                    <option value="Female">女性</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">年齡</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    min="18"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">駕照狀態</label>
                                <select
                                    name="driving_license"
                                    value={formData.driving_license}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value={1}>擁有駕照</option>
                                    <option value={0}>無駕照</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">地區代碼</label>
                                <input
                                    type="number"
                                    name="region_code"
                                    value={formData.region_code}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">是否已有保險</label>
                                <select
                                    name="previously_insured"
                                    value={formData.previously_insured}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value={1}>已有保險</option>
                                    <option value={0}>無保險</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">車輛年齡</label>
                                <select
                                    name="vehicle_age"
                                    value={formData.vehicle_age}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="< 1 Year">少於1年</option>
                                    <option value="1-2 Year">1-2年</option>
                                    <option value="> 2 Years">超過2年</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">車輛損壞歷史</label>
                                <select
                                    name="vehicle_damage"
                                    value={formData.vehicle_damage}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Yes">有損壞記錄</option>
                                    <option value="No">無損壞記錄</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">年保費</label>
                                <input
                                    type="number"
                                    name="annual_premium"
                                    value={formData.annual_premium}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">銷售渠道代碼</label>
                                <input
                                    type="number"
                                    name="policy_sales_channel"
                                    value={formData.policy_sales_channel}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">客戶關係長度（天）</label>
                                <input
                                    type="number"
                                    name="vintage"
                                    value={formData.vintage}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded"
                                    min="0"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            disabled={loading}
                        >
                            {loading ? '處理中...' : '進行預測'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                                {error}
                            </div>
                        )}
                    </form>
                </div>

                <div>
                    <div className="bg-white p-6 rounded shadow mb-6">
                        <h2 className="text-xl font-bold mb-4">預測結果</h2>

                        {prediction ? (
                            <div className={`p-4 border-l-4 rounded ${getPredictionClass()}`}>
                                <div className="text-xl mb-2">
                                    {prediction.prediction === 1
                                        ? '✅ 客戶可能會購買車險'
                                        : '❌ 客戶可能不會購買車險'}
                                </div>
                                <div className="text-gray-700">
                                    <p>購買可能性: <span
                                        className="font-bold">{(prediction.probability * 100).toFixed(2)}%</span></p>
                                    <p>決策閾值: {(prediction.threshold * 100).toFixed(2)}%</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500 italic">
                                請填寫並提交客戶資料以獲得預測結果
                            </div>
                        )}
                    </div>

                    {prediction && prediction.features_importance && (
                        <div className="bg-white p-6 rounded shadow">
                            <h3 className="text-lg font-bold mb-4">特徵影響因素</h3>
                            <div className="space-y-3">
                                {Object.entries(prediction.features_importance)
                                    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
                                    .map(([feature, importance]) => (
                                        <div key={feature} className="flex items-center">
                                            <div className="w-1/3 text-sm">{feature}</div>
                                            <div className="w-2/3">
                                                <div className="relative h-4 w-full bg-gray-200 rounded">
                                                    <div
                                                        className={`absolute top-0 left-0 h-full rounded ${importance > 0 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                        style={{width: `${Math.min(Math.abs(importance) * 100, 100)}%`}}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-right mt-1">
                                                    {importance > 0 ? '+' : ''}{importance.toFixed(3)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Prediction; 