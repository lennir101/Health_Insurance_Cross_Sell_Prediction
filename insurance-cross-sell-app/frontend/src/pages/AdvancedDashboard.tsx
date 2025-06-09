import React, {useState} from 'react';
import {D3GaugeChart, D3BubbleChart, D3AreaChart} from '@/components/charts';
import {chartColors} from '@/lib/themes';

const AdvancedDashboard: React.FC = () => {
    // 示例數據
    const [metrics] = useState({
        accuracy: 0.835,
        precision: 0.67,
        recall: 0.59,
        f1_score: 0.628,
        auc_roc: 0.81
    });

    // 模擬歷史預測數據
    const [predictionsHistory] = useState([
        {date: new Date('2025-01-01'), value: 120, category: '新客戶'},
        {date: new Date('2025-02-01'), value: 150, category: '新客戶'},
        {date: new Date('2025-03-01'), value: 200, category: '新客戶'},
        {date: new Date('2025-04-01'), value: 180, category: '新客戶'},
        {date: new Date('2025-05-01'), value: 250, category: '新客戶'},
        {date: new Date('2025-06-01'), value: 300, category: '新客戶'}
    ]);

    // 特徵分布數據
    const [bubbleData] = useState([
        {id: 'gender-male', name: '男性', value: 2300, group: '性別'},
        {id: 'gender-female', name: '女性', value: 2100, group: '性別'},
        {id: 'vehicle-age-1', name: '< 1 年', value: 1800, group: '車輛年齡'},
        {id: 'vehicle-age-2', name: '1-2 年', value: 1600, group: '車輛年齡'},
        {id: 'vehicle-age-3', name: '> 2 年', value: 1000, group: '車輛年齡'},
        {id: 'vehicle-damage-yes', name: '已損壞', value: 2200, group: '車輛損壞'},
        {id: 'vehicle-damage-no', name: '未損壞', value: 2200, group: '車輛損壞'},
        {id: 'insured-yes', name: '已投保', value: 1800, group: '曾經投保'},
        {id: 'insured-no', name: '未投保', value: 2600, group: '曾經投保'}
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">進階分析儀表板</h1>
                <p className="text-gray-600">健康保險交叉銷售預測模型的互動式數據分析</p>
            </div>

            {/* 模型指標卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">準確率</h3>
                            <p className="text-2xl font-bold text-gray-900">{(metrics.accuracy * 100).toFixed(2)}%</p>
                        </div>
                        <span className="p-2 rounded-full bg-blue-50 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </span>
                    </div>
                    <div className="mt-2">
                        <D3GaugeChart
                            value={metrics.accuracy * 100}
                            size={150}
                            thickness={15}
                            foregroundColor={chartColors[0]}
                        />
                    </div>
                </div>

                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">精確率</h3>
                            <p className="text-2xl font-bold text-gray-900">{(metrics.precision * 100).toFixed(2)}%</p>
                        </div>
                        <span className="p-2 rounded-full bg-green-50 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20v-6M6 20V10M18 20V4"></path>
              </svg>
            </span>
                    </div>
                    <div className="mt-2">
                        <D3GaugeChart
                            value={metrics.precision * 100}
                            size={150}
                            thickness={15}
                            foregroundColor={chartColors[1]}
                        />
                    </div>
                </div>

                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">召回率</h3>
                            <p className="text-2xl font-bold text-gray-900">{(metrics.recall * 100).toFixed(2)}%</p>
                        </div>
                        <span className="p-2 rounded-full bg-purple-50 text-purple-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </span>
                    </div>
                    <div className="mt-2">
                        <D3GaugeChart
                            value={metrics.recall * 100}
                            size={150}
                            thickness={15}
                            foregroundColor={chartColors[2]}
                        />
                    </div>
                </div>

                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">F1 分數</h3>
                            <p className="text-2xl font-bold text-gray-900">{(metrics.f1_score * 100).toFixed(2)}%</p>
                        </div>
                        <span className="p-2 rounded-full bg-amber-50 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </span>
                    </div>
                    <div className="mt-2">
                        <D3GaugeChart
                            value={metrics.f1_score * 100}
                            size={150}
                            thickness={15}
                            foregroundColor={chartColors[3]}
                        />
                    </div>
                </div>
            </div>

            {/* 圖表區域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* 客戶特徵氣泡圖 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">客戶特徵分佈</h2>
                    <div className="h-80">
                        <D3BubbleChart
                            data={bubbleData}
                            width={500}
                            height={320}
                            title=""
                            valueFormat={(n) => n.toLocaleString()}
                            className="mx-auto"
                        />
                    </div>
                </div>

                {/* 預測結果趨勢區域圖 */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">預測結果趨勢</h2>
                    <div className="h-80">
                        <D3AreaChart
                            data={predictionsHistory}
                            width={500}
                            height={320}
                            xAxisLabel="月份"
                            yAxisLabel="預測數量"
                            areaColor={chartColors[0]}
                            valueFormat={(d) => d.toString()}
                            dateFormat="%Y-%m"
                            className="mx-auto"
                        />
                    </div>
                </div>
            </div>

            {/* 數據洞察卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">客戶群體洞察</h3>
                    <p className="text-gray-700">根據數據分析，擁有車輛損壞記錄的客戶更有可能購買保險。建議將營銷活動優先針對此類客戶。</p>
                </div>

                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">模型性能分析</h3>
                    <p className="text-gray-700">當前模型在預測客戶購買意願方面表現良好，特別是在精確率方面。這表明模型識別潛在客戶的能力較強。</p>
                </div>

                <div
                    className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">改進建議</h3>
                    <p className="text-gray-700">為提高模型性能，建議收集更多關於客戶車輛使用情況和歷史保險記錄的數據，這可能有助於提高預測準確性。</p>
                </div>
            </div>
        </div>
    );
};

export default AdvancedDashboard; 