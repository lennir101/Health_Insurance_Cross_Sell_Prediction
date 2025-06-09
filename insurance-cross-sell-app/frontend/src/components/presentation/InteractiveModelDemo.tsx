import React, {useState, useEffect} from 'react';
import {Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {Button} from '@/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {Progress} from '@/components/ui/progress';
import {Tooltip} from 'react-tooltip';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Treemap,
    Scatter
} from 'recharts';
import {
    Car,
    Users,
    Calendar,
    CreditCard,
    Shield,
    AlertTriangle,
    Gauge,
    User,
    DollarSign,
    BarChart4,
    PieChart as PieChartIcon,
    BarChart2,
    Network,
    TreePine,
    Map,
    Waves
} from 'lucide-react';
import CountUp from 'react-countup';
import ApiService from '@/services/api';
import D3BubbleChart from '@/components/charts/D3BubbleChart';
import D3GaugeChart from '@/components/charts/D3GaugeChart';
import D3AreaChart from '@/components/charts/D3AreaChart';
import { motion, AnimatePresence } from 'framer-motion';

interface InteractiveModelDemoProps {
    className?: string;
}

// 圖表顏色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
const RADIAN = Math.PI / 180;

// 自定義雷達圖標籤
const renderRadarLabel = ({payload, x, y, textAnchor, stroke, radius}: any) => {
    return (
        <text x={x} y={y} textAnchor={textAnchor} fill="#666" fontSize={12}>
            {payload.value}
        </text>
    );
};

// 自定義餅圖標籤
const renderCustomizedLabel = ({cx, cy, midAngle, innerRadius, outerRadius, percent, index, name}: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

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
        vintage: 100,
        // 模型參數默認值
        subsample: 0.8,
        colsample_bytree: 0.8,
        scale_pos_weight: 2.0,
        max_depth: 8,
        learning_rate: 0.1,
        min_child_weight: 2,
        threshold: 0.35
    });

    // 預測結果狀態
    const [prediction, setPrediction] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    // 特徵重要性的顯示狀態
    const [showImportance, setShowImportance] = useState(false);

    // 添加圖表顯示狀態
    const [activeChart, setActiveChart] = useState<'bar' | 'pie' | 'radar' | 'bubble' | 'treemap' | 'heatmap' | 'decision-tree' | 'force-directed' | 'wave'>('bar');

    // 添加顧客風險評分
    const [riskScore, setRiskScore] = useState<number>(0);

    // 添加各類型圖表數據
    const [featureInsights, setFeatureInsights] = useState<any[]>([]);

    // 添加模型參數面板顯示狀態
    const [showModelParams, setShowModelParams] = useState(false);

    // 添加A/B測試狀態
    const [abTestResults, setAbTestResults] = useState<{
        original: any;
        modified: any;
    }>({
        original: null,
        modified: null
    });

    // 添加模型參數說明
    const [modelParamsDesc, setModelParamsDesc] = useState<Record<string, string>>({});

    // 添加错误处理状态
    const [error, setError] = useState<string | null>(null);

    // 添加模态窗口状态和内容
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState<{
        title: string;
        content: React.ReactNode;
    }>({
        title: '',
        content: null
    });

    // 根據特徵值的變化更新預測
    const handleFeatureChange = (feature: string, value: any) => {
        setCustomerFeatures(prev => ({
            ...prev,
            [feature]: value
        }));

        // 自動觸發預測，避免需要手動點擊按鈕
        if (!loading) {
            // 使用setTimeout來避免頻繁調用API
            if (featureChangeTimer) clearTimeout(featureChangeTimer);
            setFeatureChangeTimer(setTimeout(() => {
                handlePredict();
            }, 500)); // 500毫秒延遲，避免過於頻繁的API調用
        }
    };

    // 特徵變更計時器
    const [featureChangeTimer, setFeatureChangeTimer] = useState<NodeJS.Timeout | null>(null);

    // 計算風險評分
    useEffect(() => {
        // 簡單風險計算邏輯，可根據實際模型調整
        let score = 50; // 基礎分數

        // 根據各特徵調整分數
        if (customerFeatures.previously_insured === 0) score += 15;
        if (customerFeatures.vehicle_damage === 'Yes') score += 10;
        if (customerFeatures.age < 25) score += 8;
        else if (customerFeatures.age > 60) score += 5;
        if (customerFeatures.vehicle_age === '> 2 Years') score += 7;
        if (customerFeatures.annual_premium < 20000) score -= 5;
        else if (customerFeatures.annual_premium > 50000) score += 8;

        // 確保分數範圍在0-100之間
        score = Math.max(0, Math.min(100, score));
        setRiskScore(score);
    }, [customerFeatures]);

    // 執行預測
    const handlePredict = async () => {
        console.log('開始預測處理...');
        setLoading(true);
        setError(null); // 重置错误状态
        try {
            console.log('發送預測請求:', customerFeatures);
            const response = await ApiService.submitPrediction(customerFeatures);
            console.log('收到預測響應:', response);

            if (response.status === 200) {
                if (response.data.error) {
                    // 处理后端返回的业务逻辑错误
                    setError(response.data.error);
                    console.error('预测返回错误:', response.data.error);
                } else {
                    // 处理API响应结果
                    console.log('處理預測結果數據');
                    const predictionData = {
                        prediction: response.data.prediction,
                        probability: response.data.probability,
                        features_importance: response.data.features_importance || {},
                        current_model_params: response.data.current_model_params || {},
                        model_params_desc: response.data.model_params_desc || {}
                    };
                    console.log('設置預測結果:', predictionData);
                    setPrediction(predictionData);

                    // 准备图表数据
                    if (predictionData.features_importance) {
                        console.log('處理特徵重要性數據');
                        const chartData = Object.entries(predictionData.features_importance)
                            .map(([key, value]) => ({
                                name: mapFeatureName(key),
                                value: (value as number) * 100,
                                key: key
                            }))
                            .sort((a, b) => b.value - a.value);
                        console.log('設置圖表數據:', chartData);
                        setFeatureInsights(chartData);
                    } else {
                        console.warn('特徵重要性數據為空');
                    }
                }
            } else {
                setError(response.message || '预测请求失败');
                console.error('预测失败:', response.message);
            }
        } catch (error: any) {
            setError(error.message || '预测请求出错');
            console.error('预测请求出错:', error);
        } finally {
            setLoading(false);
            console.log('預測流程完成');
        }
    };

    // 渲染特徵重要性
    const renderFeatureImportance = () => {
        if (!prediction || !prediction.features_importance) return null;

        const importanceEntries = Object.entries(prediction.features_importance)
            .map(([key, value]) => ({name: key, value: value as number}))
            .sort((a, b) => b.value - a.value);

        return (
            <div className="mt-4 space-y-4">
                <div>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium mb-2">特徵對本次預測的影響</h3>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={showFeatureImportanceDetails}
                            className="flex items-center gap-1 text-xs"
                        >
                            <span>查看計算原理</span>
                        </Button>
                    </div>
                    <div className="flex flex-wrap space-x-2 mb-2">
                        <Button
                            variant={activeChart === 'bar' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('bar')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <BarChart4 size={16}/> 條形圖
                        </Button>
                        <Button
                            variant={activeChart === 'pie' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('pie')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <PieChartIcon size={16}/> 餅圖
                        </Button>
                        <Button
                            variant={activeChart === 'radar' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('radar')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <AlertTriangle size={16}/> 雷達圖
                        </Button>
                        <Button
                            variant={activeChart === 'bubble' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('bubble')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <Gauge size={16}/> 互動氣泡圖
                        </Button>
                        <Button
                            variant={activeChart === 'treemap' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('treemap')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <TreePine size={16}/> 矩形樹圖
                        </Button>
                        <Button
                            variant={activeChart === 'heatmap' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('heatmap')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <Map size={16}/> 熱力圖
                        </Button>
                        <Button
                            variant={activeChart === 'force-directed' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('force-directed')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <Network size={16}/> 力導向圖
                        </Button>
                        <Button
                            variant={activeChart === 'wave' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('wave')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <Waves size={16}/> 水波動態圖
                        </Button>
                        <Button
                            variant={activeChart === 'decision-tree' ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveChart('decision-tree')}
                            className="flex items-center gap-1 mb-1"
                        >
                            <BarChart2 size={16}/> 決策樹視圖
                        </Button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeChart}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                {/* 原有的圖表類型 */}
                {activeChart === 'bar' && (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={featureInsights}
                                layout="vertical"
                                margin={{top: 5, right: 30, left: 80, bottom: 5}}
                            >
                                <CartesianGrid strokeDasharray="3 3"/>
                                <XAxis type="number" domain={[0, 'dataMax']}/>
                                <YAxis dataKey="name" type="category" width={80}/>
                                <RechartsTooltip
                                    formatter={(value: any, name: any, props: any) => [
                                        `影響力: ${value.toFixed(2)}%`,
                                        mapFeatureName(props.payload.key)
                                    ]}
                                    labelFormatter={() => '特徵影響詳情'}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border rounded shadow-md">
                                                    <p className="font-bold text-sm">{mapFeatureName(data.key)}</p>
                                                    <p className="text-sm text-gray-600">影響力: {data.value.toFixed(2)}%</p>
                                                    <div className="mt-2 text-xs text-gray-500">
                                                        <p>計算方式: SHAP值 (SHapley Additive exPlanations)</p>
                                                        <p>當前值: {
                                                            data.key in customerFeatures 
                                                                ? String(customerFeatures[data.key as keyof typeof customerFeatures])
                                                                : '未知'
                                                        }</p>
                                                        <p>總體平均影響: {(data.value/100 * prediction.probability * 100).toFixed(2)}%</p>
                                                        <p>特徵變化前後影響差異: {(data.value * 0.01 * 100).toFixed(2)}</p>
                                                        <p className="mt-1 text-xs italic">* 懸停查看更多特徵計算細節</p>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                    {featureInsights.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeChart === 'pie' && (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={featureInsights}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    animationDuration={1000}
                                >
                                    {featureInsights.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any, name: any, props: any) => [
                                        `${value.toFixed(2)}%`,
                                        mapFeatureName(props.payload.key)
                                    ]}
                                />
                                <Legend
                                    formatter={(value, entry, index) => mapFeatureName(featureInsights[index as number]?.key || '')}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {activeChart === 'radar' && (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={featureInsights}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                <PolarRadiusAxis domain={[0, 'auto']} tick={{ fill: '#6b7280' }} />
                                <Radar
                                    name="特徵影響力"
                                    dataKey="value"
                                    stroke="#8884d8"
                                    fill="#8884d8"
                                    fillOpacity={0.6}
                                    animationDuration={1000}
                                    animationEasing="ease-in-out"
                                />
                                <RechartsTooltip
                                    formatter={(value: any, name: any, props: any) => [
                                        `${value.toFixed(2)}%`,
                                        mapFeatureName(props.payload.key)
                                    ]}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* 新增互動氣泡圖 */}
                {activeChart === 'bubble' && (
                    <div className="h-80 w-full">
                        <D3BubbleChart
                            data={featureInsights.map(insight => ({
                                id: insight.key,
                                name: mapFeatureName(insight.key),
                                value: insight.value,
                                group: insight.value > 20 ? '高影響力' : insight.value > 10 ? '中影響力' : '低影響力'
                            }))}
                            width={600}
                            height={300}
                            title="特徵影響力互動氣泡圖"
                            valueFormat={(n) => `${n.toFixed(1)}%`}
                            tooltipContent={(data) => (
                                <div>
                                    <div className="font-semibold">{data.name}</div>
                                    <div>影響力: {data.value.toFixed(1)}%</div>
                                    <div>分類: {data.group}</div>
                                </div>
                            )}
                        />
                    </div>
                )}

                {/* 新增矩形樹圖 */}
                {activeChart === 'treemap' && (
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <Treemap
                                data={featureInsights.map(item => ({
                                    name: mapFeatureName(item.key),
                                    size: item.value,
                                    key: item.key
                                }))}
                                dataKey="size"
                                nameKey="name"
                                aspectRatio={4/3}
                                stroke="#fff"
                                animationDuration={1000}
                                animationEasing="ease-in-out"
                            >
                                <RechartsTooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const value = payload[0].value as number;
                                            return (
                                                <div className="bg-white p-2 border rounded shadow-md">
                                                    <p className="font-semibold">{payload[0].payload.name}</p>
                                                    <p>影響力: {value.toFixed(2)}%</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </Treemap>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* 新增熱力圖 */}
                {activeChart === 'heatmap' && (
                    <div className="h-80 w-full bg-slate-50 rounded-lg p-4">
                        <div className="text-center mb-2 font-medium">特徵影響力熱力分布</div>
                        <div className="grid grid-cols-5 gap-2 h-64 w-full">
                            {featureInsights.map((insight, index) => {
                                // 計算色彩強度
                                const intensity = Math.min(100, insight.value * 3);
                                const bgColor = `hsla(${240 - intensity * 2.4}, ${intensity}%, 60%, ${0.3 + (intensity / 100) * 0.7})`;
                                
                                return (
                                    <motion.div
                                        key={insight.key}
                                        className="flex flex-col items-center justify-center rounded-lg shadow-sm cursor-pointer overflow-hidden"
                                        style={{ backgroundColor: bgColor }}
                                        whileHover={{ scale: 1.05 }}
                                        data-tooltip-id={`heatmap-tooltip-${index}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ 
                                            opacity: 1, 
                                            scale: 1,
                                            transition: { delay: index * 0.1, duration: 0.5 }
                                        }}
                                    >
                                        <div className="text-xs font-semibold text-center text-slate-800">
                                            {mapFeatureName(insight.key)}
                                        </div>
                                        <div className="text-sm font-bold text-slate-900">
                                            {insight.value.toFixed(1)}%
                                        </div>
                                        <Tooltip id={`heatmap-tooltip-${index}`} place="top">
                                            <div className="p-1">
                                                <div className="font-semibold">{mapFeatureName(insight.key)}</div>
                                                <div>影響力: {insight.value.toFixed(2)}%</div>
                                                <div>當前值: {
                                                    insight.key in customerFeatures 
                                                        ? String(customerFeatures[insight.key as keyof typeof customerFeatures])
                                                        : '未知'
                                                }</div>
                                            </div>
                                        </Tooltip>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 新增力導向圖 */}
                {activeChart === 'force-directed' && (
                    <div className="h-80 w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4">
                        <div className="text-center mb-2 font-medium">特徵關聯力導向圖</div>
                        <div className="relative h-64 w-full">
                            {featureInsights.map((insight, index) => {
                                // 模擬力導向佈局的位置
                                const angle = (index / featureInsights.length) * Math.PI * 2;
                                const radius = 100 * (0.6 + (insight.value / 50));
                                const delay = index * 0.1;
                                
                                return (
                                    <motion.div
                                        key={insight.key}
                                        className="absolute flex flex-col items-center justify-center"
                                        initial={{ 
                                            x: 250, 
                                            y: 100,
                                            opacity: 0
                                        }}
                                        animate={{
                                            x: 250 + Math.cos(angle) * radius,
                                            y: 100 + Math.sin(angle) * radius,
                                            opacity: 1,
                                            transition: { 
                                                delay,
                                                type: "spring",
                                                stiffness: 50,
                                                damping: 15
                                            }
                                        }}
                                    >
                                        <motion.div
                                            className="flex items-center justify-center rounded-full bg-indigo-100 border border-indigo-300"
                                            style={{ 
                                                width: `${40 + insight.value}px`, 
                                                height: `${40 + insight.value}px`,
                                            }}
                                            whileHover={{ scale: 1.1 }}
                                            data-tooltip-id={`network-tooltip-${index}`}
                                        >
                                            <span className="text-xs font-semibold text-indigo-800">
                                                {insight.value.toFixed(0)}%
                                            </span>
                                        </motion.div>
                                        <div className="mt-1 text-xs font-medium text-slate-700">
                                            {mapFeatureName(insight.key).length > 10 
                                                ? mapFeatureName(insight.key).substring(0, 8) + '...' 
                                                : mapFeatureName(insight.key)}
                                        </div>
                                        <Tooltip id={`network-tooltip-${index}`} place="top">
                                            <div className="p-1">
                                                <div className="font-semibold">{mapFeatureName(insight.key)}</div>
                                                <div>影響力: {insight.value.toFixed(2)}%</div>
                                            </div>
                                        </Tooltip>
                                    </motion.div>
                                );
                            })}
                            
                            {/* 中心點及連線 */}
                            <motion.div
                                className="absolute top-[100px] left-[250px] w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center z-10"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, transition: { delay: 0.2, type: "spring" } }}
                            >
                                <span className="text-xs font-bold text-white">預測</span>
                            </motion.div>
                            
                            {/* 繪製連線 - 在 SVG 中 */}
                            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }}>
                                {featureInsights.map((insight, index) => {
                                    const angle = (index / featureInsights.length) * Math.PI * 2;
                                    const radius = 100 * (0.6 + (insight.value / 50));
                                    const x2 = 250 + Math.cos(angle) * radius;
                                    const y2 = 100 + Math.sin(angle) * radius;
                                    
                                    return (
                                        <motion.line
                                            key={`line-${insight.key}`}
                                            x1="250"
                                            y1="100"
                                            x2={x2}
                                            y2={y2}
                                            initial={{ opacity: 0 }}
                                            animate={{ 
                                                opacity: 0.5,
                                                transition: { delay: index * 0.1 + 0.3 }
                                            }}
                                            stroke={COLORS[index % COLORS.length]}
                                            strokeWidth={1 + (insight.value / 20)}
                                            strokeDasharray={insight.value < 10 ? "2,2" : "none"}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    </div>
                )}

                {/* 新增水波動態圖 */}
                {activeChart === 'wave' && (
                    <div className="h-80 w-full flex flex-wrap justify-center items-center gap-4">
                        {featureInsights.slice(0, 4).map((insight, index) => (
                            <div key={insight.key} className="relative">
                                <D3GaugeChart
                                    value={insight.value}
                                    min={0}
                                    max={100}
                                    label={mapFeatureName(insight.key)}
                                    size={150}
                                    thickness={15}
                                    foregroundColor={COLORS[index % COLORS.length]}
                                    animationDuration={1000 + index * 200}
                                    className="mx-2"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* 新增決策樹視圖 */}
                {activeChart === 'decision-tree' && (
                    <div className="h-80 w-full bg-slate-50 rounded-lg p-2">
                        <div className="text-center mb-2 font-medium">決策路徑視圖</div>
                        <div className="relative h-64 w-full overflow-hidden">
                            {/* 主節點 */}
                            <div className="absolute top-5 left-1/2 transform -translate-x-1/2">
                                <motion.div 
                                    className="relative flex flex-col items-center"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                                >
                                    <div className="bg-blue-100 border-2 border-blue-500 rounded-lg p-2 shadow-md w-40 text-center">
                                        <div className="font-semibold text-blue-800">預測結果</div>
                                        <div className="text-lg font-bold text-blue-900">
                                            {prediction.probability > 0.5 ? '很可能購買' : '可能不購買'}
                                        </div>
                                        <div className="text-sm font-medium text-blue-700">
                                            概率: {(prediction.probability * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="h-5 w-0.5 bg-gray-400"></div>
                                </motion.div>
                            </div>

                            {/* 創建決策樹節點 */}
                            {featureInsights.slice(0, 3).map((insight, index) => {
                                const horizontalPosition = (index - 1) * 160 + 300;
                                const delay = 0.5 + index * 0.2;
                                
                                return (
                                    <React.Fragment key={insight.key}>
                                        {/* 決策節點 */}
                                        <motion.div 
                                            className="absolute top-32 text-center"
                                            style={{ left: `${horizontalPosition}px` }}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay, duration: 0.5 } }}
                                        >
                                            <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-2 shadow-sm w-32">
                                                <div className="font-semibold text-indigo-800 text-sm">
                                                    {mapFeatureName(insight.key)}
                                                </div>
                                                <div className="text-xs text-indigo-600">
                                                    影響力: {insight.value.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-indigo-500 mt-1">
                                                    當前值: {
                                                        insight.key in customerFeatures 
                                                            ? String(customerFeatures[insight.key as keyof typeof customerFeatures])
                                                            : '未知'
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                        
                                        {/* 連接線 */}
                                        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                            <motion.path
                                                d={`M 300 85 Q 300 120, ${horizontalPosition + 16} 130`}
                                                fill="transparent"
                                                stroke="#9ca3af"
                                                strokeWidth="1.5"
                                                initial={{ pathLength: 0 }}
                                                animate={{ 
                                                    pathLength: 1, 
                                                    transition: { delay: delay - 0.2, duration: 0.5 } 
                                                }}
                                            />
                                        </svg>
                                        
                                        {/* 子節點 */}
                                        {index === 0 && (
                                            <>
                                                <motion.div 
                                                    className="absolute top-60 left-[220px] text-center"
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0, transition: { delay: delay + 0.3, duration: 0.5 } }}
                                                >
                                                    <div className="bg-green-100 border border-green-300 rounded-lg p-2 shadow-sm w-28">
                                                        <div className="font-semibold text-green-800 text-xs">是</div>
                                                        <div className="text-sm font-medium text-green-700">
                                                            +{(insight.value * 0.7).toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </motion.div>
                                                <motion.div 
                                                    className="absolute top-60 left-[300px] text-center"
                                                    initial={{ opacity: 0, y: -20 }}
                                                    animate={{ opacity: 1, y: 0, transition: { delay: delay + 0.3, duration: 0.5 } }}
                                                >
                                                    <div className="bg-red-100 border border-red-300 rounded-lg p-2 shadow-sm w-28">
                                                        <div className="font-semibold text-red-800 text-xs">否</div>
                                                        <div className="text-sm font-medium text-red-700">
                                                            -{(insight.value * 0.3).toFixed(1)}%
                                                        </div>
                                                    </div>
                                                </motion.div>
                                                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                                    <motion.path
                                                        d={`M ${horizontalPosition + 16} 172 L 234 190`}
                                                        fill="transparent"
                                                        stroke="#9ca3af"
                                                        strokeWidth="1.5"
                                                        strokeDasharray="2,2"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ 
                                                            pathLength: 1, 
                                                            transition: { delay: delay + 0.2, duration: 0.5 } 
                                                        }}
                                                    />
                                                    <motion.path
                                                        d={`M ${horizontalPosition + 16} 172 L 314 190`}
                                                        fill="transparent"
                                                        stroke="#9ca3af"
                                                        strokeWidth="1.5"
                                                        strokeDasharray="2,2"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ 
                                                            pathLength: 1, 
                                                            transition: { delay: delay + 0.2, duration: 0.5 } 
                                                        }}
                                                    />
                                                </svg>
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                )}
                </motion.div>
                </AnimatePresence>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {importanceEntries.map(({name, value}) => (
                        <div key={name} className="space-y-1">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    {name === 'gender' && <User size={16} className="text-blue-500"/>}
                                    {name === 'age' && <Calendar size={16} className="text-green-500"/>}
                                    {name === 'vehicle_age' && <Car size={16} className="text-amber-500"/>}
                                    {name === 'vehicle_damage' && <AlertTriangle size={16} className="text-red-500"/>}
                                    {name === 'annual_premium' && <DollarSign size={16} className="text-purple-500"/>}
                                    {name === 'annual_premium_log' &&
                                        <DollarSign size={16} className="text-indigo-500"/>}
                                    {name === 'previously_insured' && <Shield size={16} className="text-indigo-500"/>}
                                    <span
                                        className="text-sm font-medium cursor-help"
                                        data-tooltip-id={`feature-${name}`}
                                        data-tooltip-content={getFeatureDescription(name)}
                                    >
                                        {mapFeatureName(name)}
                                    </span>
                                    <Tooltip id={`feature-${name}`} place="top"/>
                                </div>
                                <span className="text-sm text-gray-500 font-semibold">{(value * 100).toFixed(1)}%</span>
                            </div>
                            <Progress
                                value={value * 100}
                                className={`h-2 ${
                                    value > 0.25 ? "[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" :
                                        value > 0.15 ? "[&>div]:bg-gradient-to-r [&>div]:from-green-400 [&>div]:to-blue-500" :
                                            "[&>div]:bg-gradient-to-r [&>div]:from-amber-400 [&>div]:to-green-400"
                                }`}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // 显示特征重要性计算原理弹框
    const showFeatureImportanceDetails = () => {
        setModalContent({
            title: '特徵重要性計算原理',
            content: (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">SHAP值 (SHapley Additive exPlanations)</h3>
                        <p className="text-sm text-gray-700">
                            SHAP值是一種基於博弈論的方法，用於解釋任何機器學習模型的輸出。它將每個特徵視為"玩家"，預測被視為"遊戲"的"收益"。
                        </p>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-mono">
                                SHAP(特徵) = ∑ |S|!(|F|-|S|-1)!/|F|! [f(x<sub>有特徵</sub>) - f(x<sub>無特徵</sub>)]
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                                其中，F是所有特徵的集合，S是不包含當前特徵的子集，f是模型預測函數
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-1">樹模型特徵重要性</h3>
                        <p className="text-sm text-gray-700">
                            在基於樹的模型(如XGBoost、LightGBM)中，特徵重要性通常基於以下計算：
                        </p>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                            <li>特徵在樹中被選為分裂點的次數</li>
                            <li>每次分裂對模型性能提升的貢獻度</li>
                            <li>分裂導致的不純度(如基尼系數)減少量</li>
                        </ul>
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm">
                                重要性(Feature) = ∑<sub>j</sub> (改進<sub>j</sub> × 節點<sub>j</sub>出現次數)
                            </p>
                            <p className="mt-1 text-xs text-gray-600">
                                其中，改進表示特徵在節點j處分裂導致的性能提升
                            </p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-1">Permutation重要性</h3>
                        <p className="text-sm text-gray-700">
                            通過隨機打亂單個特徵的值並測量對模型性能的影響來計算重要性：
                        </p>
                        <ol className="list-decimal pl-5 mt-1 text-sm">
                            <li>計算原始數據上的模型性能(如準確率)</li>
                            <li>隨機打亂特徵的值</li>
                            <li>使用打亂後的數據計算性能</li>
                            <li>性能下降越大，特徵越重要</li>
                        </ol>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-1">當前模型使用的方法</h3>
                        <p className="text-sm text-gray-700">
                            本模型使用了基於樹的特徵重要性和SHAP值的組合方法：
                        </p>
                        <ul className="list-disc pl-5 mt-1 text-sm">
                            <li>首先計算模型固有的特徵重要性</li>
                            <li>對當前預測樣本計算SHAP值</li>
                            <li>結合全局和局部重要性，生成最終的特徵影響因子</li>
                            <li>歸一化處理，使所有特徵重要性總和為1</li>
                        </ul>
                    </div>
                </div>
            )
        });
        setShowModal(true);
    };

    // 添加模态窗口组件
    const Modal = ({isOpen, onClose, title, children}: {
        isOpen: boolean;
        onClose: () => void;
        title: string;
        children: React.ReactNode
    }) => {
        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div
                    className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                        <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
                    </div>

                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen"
                          aria-hidden="true">&#8203;</span>

                    <div
                        className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            <div className="sm:flex sm:items-start">
                                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                        {title}
                                    </h3>
                                    <div className="mt-2">
                                        {children}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                            <button
                                type="button"
                                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                onClick={onClose}
                            >
                                关闭
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // 將特徵名稱轉換為中文顯示
    const mapFeatureName = (name: string): string => {
        const nameMap: Record<string, string> = {
            'gender': '性別',
            'age': '年齡',
            'driving_license': '駕照',
            'region_code': '區域代碼',
            'previously_insured': '已投保狀態',
            'vehicle_age': '車齡',
            'vehicle_damage': '車輛損壞',
            'annual_premium': '年保費',
            'annual_premium_log': '年保費(對數)',
            'policy_sales_channel': '銷售渠道',
            'vintage': '客戶資歷'
        };
        return nameMap[name] || name;
    };

    // 獲取特徵的詳細描述
    const getFeatureDescription = (name: string): string => {
        const descriptionMap: Record<string, string> = {
            'gender': '客戶性別。男性和女性在保險需求和風險評估上可能存在差異。',
            'age': '客戶年齡。年齡是影響保險定價和風險評估的重要因素，不同年齡段的客戶有不同的風險特徵。',
            'driving_license': '客戶是否擁有駕照。這是購買車險的基本要求。',
            'region_code': '客戶所在區域代碼。不同地區的風險特徵和保險需求可能有所不同。',
            'previously_insured': '客戶是否已經購買了車險。已有車險的客戶購買額外保險的可能性較低。',
            'vehicle_age': '車輛使用年限。車齡會影響車輛的性能和可靠性，從而影響保險風險和客戶需求。',
            'vehicle_damage': '車輛是否曾經損壞。有損壞歷史的車輛通常有更高的保險需求。',
            'annual_premium': '客戶目前支付的年保費金額。這反映了客戶的支付能力和風險程度。',
            'annual_premium_log': '年保費的自然對數值。對數轉換可以減少離群值影響，使模型更穩定。',
            'policy_sales_channel': '銷售渠道代碼。不同的銷售渠道可能覆蓋不同類型的客戶群體。',
            'vintage': '客戶與公司的關係時長（以天為單位）。長期客戶可能有不同的忠誠度和需求特徵。'
        };
        return descriptionMap[name] || '無詳細描述';
    };

    // 渲染風險評分儀表板
    const renderRiskDashboard = () => {
        // 根據風險分數確定顏色
        const getScoreColor = () => {
            if (riskScore < 40) return 'text-green-500';
            if (riskScore < 70) return 'text-amber-500';
            return 'text-red-500';
        };

        return (
            <Card className="shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">客戶風險評分</CardTitle>
                    <CardDescription className="text-xs">根據客戶特徵計算的綜合風險指數</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <div className={`text-4xl font-bold ${getScoreColor()}`}>
                            <CountUp end={riskScore} duration={1.5}/>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="h-2.5 rounded-full bg-gradient-to-r from-green-400 via-amber-500 to-red-500"
                                style={{width: `${riskScore}%`}}
                            ></div>
                        </div>
                        <p className="mt-2 text-xs text-gray-600">
                            {riskScore < 40 ? '低風險客戶' : riskScore < 70 ? '中等風險客戶' : '高風險客戶'}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // 渲染模型參數調整面板
    const renderModelParamsPanel = () => {
        return (
            <Card className="shadow-sm mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-indigo-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium flex items-center space-x-2">
                        <BarChart4 size={20} className="text-indigo-500"/>
                        <span>模型超參數調整</span>
                    </CardTitle>
                    <CardDescription>
                        調整模型參數可以優化預測效果，平衡偏差與方差
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 子採樣率 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="subsample"
                                className="flex items-center space-x-1"
                                data-tooltip-id="subsample-tooltip"
                                data-tooltip-content={modelParamsDesc.subsample || "子採樣率 - 每棵樹使用的訓練數據比例，小於1可以減少過擬合"}
                            >
                                <span>子採樣率: {customerFeatures.subsample.toFixed(2)}</span>
                            </Label>
                            <Tooltip id="subsample-tooltip"/>
                            <Slider
                                id="subsample"
                                min={0.5}
                                max={1.0}
                                step={0.01}
                                value={[customerFeatures.subsample]}
                                onValueChange={(value) => handleFeatureChange('subsample', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>更少樣本 (0.5)</span>
                                <span>全部樣本 (1.0)</span>
                            </div>
                        </div>

                        {/* 特徵採樣率 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="colsample_bytree"
                                className="flex items-center space-x-1"
                                data-tooltip-id="colsample-tooltip"
                                data-tooltip-content={modelParamsDesc.colsample_bytree || "特徵採樣率 - 每棵樹使用的特徵比例，小於1可以減少過擬合"}
                            >
                                <span>特徵採樣率: {customerFeatures.colsample_bytree.toFixed(2)}</span>
                            </Label>
                            <Tooltip id="colsample-tooltip"/>
                            <Slider
                                id="colsample_bytree"
                                min={0.5}
                                max={1.0}
                                step={0.01}
                                value={[customerFeatures.colsample_bytree]}
                                onValueChange={(value) => handleFeatureChange('colsample_bytree', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>更少特徵 (0.5)</span>
                                <span>全部特徵 (1.0)</span>
                            </div>
                        </div>

                        {/* 正樣本權重比例 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="scale_pos_weight"
                                className="flex items-center space-x-1"
                                data-tooltip-id="pos-weight-tooltip"
                                data-tooltip-content={modelParamsDesc.scale_pos_weight || "正樣本權重比例 - 處理類別不平衡問題，增加少數類的權重"}
                            >
                                <span>正樣本權重比例: {customerFeatures.scale_pos_weight.toFixed(1)}</span>
                            </Label>
                            <Tooltip id="pos-weight-tooltip"/>
                            <Slider
                                id="scale_pos_weight"
                                min={1.0}
                                max={5.0}
                                step={0.1}
                                value={[customerFeatures.scale_pos_weight]}
                                onValueChange={(value) => handleFeatureChange('scale_pos_weight', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>平衡 (1.0)</span>
                                <span>偏向正類 (5.0)</span>
                            </div>
                        </div>

                        {/* 最大深度 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="max_depth"
                                className="flex items-center space-x-1"
                                data-tooltip-id="depth-tooltip"
                                data-tooltip-content={modelParamsDesc.max_depth || "最大深度 - 樹的最大深度，增加深度可以提高模型複雜性"}
                            >
                                <span>最大樹深: {Math.round(customerFeatures.max_depth)}</span>
                            </Label>
                            <Tooltip id="depth-tooltip"/>
                            <Slider
                                id="max_depth"
                                min={3}
                                max={15}
                                step={1}
                                value={[customerFeatures.max_depth]}
                                onValueChange={(value) => handleFeatureChange('max_depth', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>簡單模型 (3)</span>
                                <span>複雜模型 (15)</span>
                            </div>
                        </div>

                        {/* 學習率 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="learning_rate"
                                className="flex items-center space-x-1"
                                data-tooltip-id="lr-tooltip"
                                data-tooltip-content={modelParamsDesc.learning_rate || "學習率 - 每次迭代對權重的調整幅度，較小的值可能需要更多迭代但有助於避免過擬合"}
                            >
                                <span>學習率: {customerFeatures.learning_rate.toFixed(2)}</span>
                            </Label>
                            <Tooltip id="lr-tooltip"/>
                            <Slider
                                id="learning_rate"
                                min={0.01}
                                max={0.3}
                                step={0.01}
                                value={[customerFeatures.learning_rate]}
                                onValueChange={(value) => handleFeatureChange('learning_rate', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>精細步長 (0.01)</span>
                                <span>快速學習 (0.3)</span>
                            </div>
                        </div>

                        {/* 決策閾值 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="threshold"
                                className="flex items-center space-x-1"
                                data-tooltip-id="threshold-tooltip"
                                data-tooltip-content={modelParamsDesc.threshold || "決策閾值 - 將概率轉換為二元預測的閾值，調整可以平衡精確率和召回率"}
                            >
                                <span>決策閾值: {customerFeatures.threshold.toFixed(2)}</span>
                            </Label>
                            <Tooltip id="threshold-tooltip"/>
                            <Slider
                                id="threshold"
                                min={0.1}
                                max={0.9}
                                step={0.01}
                                value={[customerFeatures.threshold]}
                                onValueChange={(value) => handleFeatureChange('threshold', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>偏向召回率 (0.1)</span>
                                <span>偏向準確率 (0.9)</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                // 重置模型參數為默認值
                                setCustomerFeatures(prev => ({
                                    ...prev,
                                    subsample: 0.8,
                                    colsample_bytree: 0.8,
                                    scale_pos_weight: 2.0,
                                    max_depth: 8,
                                    learning_rate: 0.1,
                                    min_child_weight: 2,
                                    threshold: 0.35
                                }));
                            }}
                            className="flex items-center space-x-1"
                        >
                            <span>重置為默認參數</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // 執行預測時更新模型參數說明
    useEffect(() => {
        if (prediction && prediction.model_params_desc) {
            setModelParamsDesc(prediction.model_params_desc);
        }
    }, [prediction]);

    // 渲染A/B測試結果比較
    const renderABTestComparison = () => {
        if (!abTestResults.original || !abTestResults.modified) {
            return null;
        }

        const original = abTestResults.original;
        const modified = abTestResults.modified;

        return (
            <Card className="shadow-sm mt-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">參數效果對比</CardTitle>
                    <CardDescription className="text-xs">比較調整參數前後的模型預測效果</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                            <h4 className="text-sm font-semibold mb-1">原始參數</h4>
                            <div
                                className={`text-2xl font-bold ${original.prediction === 1 ? 'text-green-500' : 'text-blue-500'}`}>
                                {(original.probability * 100).toFixed(1)}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {original.prediction === 1 ? '預測有興趣' : '預測無興趣'}
                            </p>
                        </div>
                        <div className="text-center">
                            <h4 className="text-sm font-semibold mb-1">修改後參數</h4>
                            <div
                                className={`text-2xl font-bold ${modified.prediction === 1 ? 'text-green-500' : 'text-blue-500'}`}>
                                {(modified.probability * 100).toFixed(1)}%
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                {modified.prediction === 1 ? '預測有興趣' : '預測無興趣'}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-center">
                        預測變化: <span className={`font-semibold ${
                        Math.abs(modified.probability - original.probability) > 0.1
                            ? 'text-red-500'
                            : Math.abs(modified.probability - original.probability) > 0.05
                                ? 'text-amber-500'
                                : 'text-green-500'
                    }`}>
                            {((modified.probability - original.probability) * 100).toFixed(1)}%
                        </span>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // 執行A/B測試比較
    const runABTest = async () => {
        // 保存當前參數
        const currentParams = {...customerFeatures};

        // 執行原始參數預測
        const originalResult = await ApiService.submitPrediction({
            ...currentParams,
            subsample: 0.8,
            colsample_bytree: 0.8,
            scale_pos_weight: 2.0,
            max_depth: 8,
            learning_rate: 0.1,
            min_child_weight: 2,
            threshold: 0.35
        });

        // 執行修改後參數預測
        const modifiedResult = await ApiService.submitPrediction(currentParams);

        if (originalResult.status === 200 && modifiedResult.status === 200) {
            setAbTestResults({
                original: originalResult.data,
                modified: modifiedResult.data
            });
        }
    };

    // 执行预测按钮组件
    const renderPredictButton = () => {
        return (
            <div className="mt-4 flex justify-center">
                <Button
                    onClick={handlePredict}
                    disabled={loading}
                    className="w-full max-w-md"
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            執行預測中...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                 xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                      d="M9 5l7 7-7 7"></path>
                            </svg>
                            執行預測
                        </div>
                    )}
                </Button>
            </div>
        );
    };

    return (
        <div className={className}>
            <Card className="shadow-md bg-white border-t-4 border-indigo-500">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
                    <CardTitle className="flex items-center space-x-2">
                        <Gauge className="text-indigo-500" size={24}/>
                        <span>互動式模型體驗</span>
                    </CardTitle>
                    <CardDescription>
                        調整下方客戶特徵參數，分析各項指標對保險交叉銷售預測的影響
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* 風險評分儀表板 */}
                    <div className="mb-4">
                        {renderRiskDashboard()}
                    </div>

                    {/* 客戶基本信息 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="gender"
                                className="flex items-center space-x-1"
                                data-tooltip-id="gender-tooltip"
                                data-tooltip-content="客戶性別會影響保險需求和風險評估"
                            >
                                <User size={16} className="text-blue-500"/>
                                <span>性別</span>
                            </Label>
                            <Tooltip id="gender-tooltip"/>
                            <Select
                                value={customerFeatures.gender}
                                onValueChange={(value) => handleFeatureChange('gender', value)}
                            >
                                <SelectTrigger id="gender"
                                               className="bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all">
                                    <SelectValue placeholder="選擇性別"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">男性</SelectItem>
                                    <SelectItem value="Female">女性</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="age"
                                className="flex items-center space-x-1"
                                data-tooltip-id="age-tooltip"
                                data-tooltip-content="年齡是影響保險定價和風險評估的重要因素，不同年齡段的客戶有不同的風險特徵"
                            >
                                <Calendar size={16} className="text-green-500"/>
                                <span>年齡: {customerFeatures.age}</span>
                            </Label>
                            <Tooltip id="age-tooltip"/>
                            <Slider
                                id="age"
                                min={18}
                                max={80}
                                step={1}
                                value={[customerFeatures.age]}
                                onValueChange={(value) => handleFeatureChange('age', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>年輕客戶 (18)</span>
                                <span>高齡客戶 (80)</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="previously_insured"
                                className="flex items-center space-x-1"
                                data-tooltip-id="insured-tooltip"
                                data-tooltip-content="已有車險的客戶購買額外保險的可能性較低"
                            >
                                <Shield size={16} className="text-indigo-500"/>
                                <span>已投保狀態</span>
                            </Label>
                            <Tooltip id="insured-tooltip"/>
                            <Select
                                value={customerFeatures.previously_insured.toString()}
                                onValueChange={(value) => handleFeatureChange('previously_insured', parseInt(value))}
                            >
                                <SelectTrigger id="previously_insured"
                                               className="bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all">
                                    <SelectValue placeholder="選擇投保狀態"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">未投保</SelectItem>
                                    <SelectItem value="1">已投保</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="vehicle_age"
                                className="flex items-center space-x-1"
                                data-tooltip-id="vehicle-age-tooltip"
                                data-tooltip-content="車齡會影響車輛的性能和可靠性，從而影響保險風險和客戶需求"
                            >
                                <Car size={16} className="text-amber-500"/>
                                <span>車輛年齡</span>
                            </Label>
                            <Tooltip id="vehicle-age-tooltip"/>
                            <Select
                                value={customerFeatures.vehicle_age}
                                onValueChange={(value) => handleFeatureChange('vehicle_age', value)}
                            >
                                <SelectTrigger id="vehicle_age"
                                               className="bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-all">
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
                            <Label
                                htmlFor="vehicle_damage"
                                className="flex items-center space-x-1"
                                data-tooltip-id="damage-tooltip"
                                data-tooltip-content="有損壞歷史的車輛通常有更高的保險需求"
                            >
                                <AlertTriangle size={16} className="text-red-500"/>
                                <span>車輛損壞狀況</span>
                            </Label>
                            <Tooltip id="damage-tooltip"/>
                            <Select
                                value={customerFeatures.vehicle_damage}
                                onValueChange={(value) => handleFeatureChange('vehicle_damage', value)}
                            >
                                <SelectTrigger id="vehicle_damage"
                                               className="bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 transition-all">
                                    <SelectValue placeholder="選擇損壞狀況"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Yes">有損壞記錄</SelectItem>
                                    <SelectItem value="No">無損壞記錄</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="annual_premium"
                                className="flex items-center space-x-1"
                                data-tooltip-id="premium-tooltip"
                                data-tooltip-content="客戶目前支付的年保費金額，反映了客戶的支付能力和風險程度"
                            >
                                <DollarSign size={16} className="text-purple-500"/>
                                <span>年保費: ¥{customerFeatures.annual_premium.toLocaleString()}</span>
                            </Label>
                            <Tooltip id="premium-tooltip"/>
                            <Slider
                                id="annual_premium"
                                min={2000}
                                max={100000}
                                step={1000}
                                value={[customerFeatures.annual_premium]}
                                onValueChange={(value) => handleFeatureChange('annual_premium', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>低保費 (¥2,000)</span>
                                <span>高保費 (¥100,000)</span>
                            </div>
                        </div>

                        {/* 添加駕照狀態 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="driving_license"
                                className="flex items-center space-x-1"
                                data-tooltip-id="license-tooltip"
                                data-tooltip-content="客戶是否擁有駕照。這是購買車險的基本要求。"
                            >
                                <User size={16} className="text-cyan-500"/>
                                <span>駕照狀態</span>
                            </Label>
                            <Tooltip id="license-tooltip"/>
                            <Select
                                value={customerFeatures.driving_license.toString()}
                                onValueChange={(value) => handleFeatureChange('driving_license', parseInt(value))}
                            >
                                <SelectTrigger id="driving_license"
                                               className="bg-gradient-to-r from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100 transition-all">
                                    <SelectValue placeholder="選擇駕照狀態"/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">擁有駕照</SelectItem>
                                    <SelectItem value="0">無駕照</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* 添加區域代碼 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="region_code"
                                className="flex items-center space-x-1"
                                data-tooltip-id="region-tooltip"
                                data-tooltip-content="客戶所在區域代碼。不同地區的風險特徵和保險需求可能有所不同。"
                            >
                                <AlertTriangle size={16} className="text-purple-500"/>
                                <span>區域代碼: {customerFeatures.region_code}</span>
                            </Label>
                            <Tooltip id="region-tooltip"/>
                            <Slider
                                id="region_code"
                                min={1}
                                max={52}
                                step={1}
                                value={[customerFeatures.region_code]}
                                onValueChange={(value) => handleFeatureChange('region_code', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>區域 1</span>
                                <span>區域 52</span>
                            </div>
                        </div>

                        {/* 添加銷售渠道 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="policy_sales_channel"
                                className="flex items-center space-x-1"
                                data-tooltip-id="channel-tooltip"
                                data-tooltip-content="銷售渠道代碼。不同的銷售渠道可能覆蓋不同類型的客戶群體。"
                            >
                                <CreditCard size={16} className="text-amber-500"/>
                                <span>銷售渠道: {customerFeatures.policy_sales_channel}</span>
                            </Label>
                            <Tooltip id="channel-tooltip"/>
                            <Slider
                                id="policy_sales_channel"
                                min={1}
                                max={163}
                                step={1}
                                value={[customerFeatures.policy_sales_channel]}
                                onValueChange={(value) => handleFeatureChange('policy_sales_channel', value[0])}
                                className="py-4"
                            />
                        </div>

                        {/* 添加客戶資歷 */}
                        <div className="space-y-2">
                            <Label
                                htmlFor="vintage"
                                className="flex items-center space-x-1"
                                data-tooltip-id="vintage-tooltip"
                                data-tooltip-content="客戶與公司的關係時長（以天為單位）。長期客戶可能有不同的忠誠度和需求特徵。"
                            >
                                <Calendar size={16} className="text-indigo-500"/>
                                <span>客戶資歷: {customerFeatures.vintage} 天</span>
                            </Label>
                            <Tooltip id="vintage-tooltip"/>
                            <Slider
                                id="vintage"
                                min={0}
                                max={365}
                                step={1}
                                value={[customerFeatures.vintage]}
                                onValueChange={(value) => handleFeatureChange('vintage', value[0])}
                                className="py-4"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>新客戶 (0)</span>
                                <span>老客戶 (365)</span>
                            </div>
                        </div>
                    </div>

                    {/* 在預測按鈕區域添加模型參數切換按鈕 */}
                    <div className="flex justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setShowModelParams(!showModelParams)}
                            className="flex items-center space-x-1"
                        >
                            <Gauge size={16}/>
                            <span>{showModelParams ? '隱藏模型參數' : '顯示模型參數'}</span>
                        </Button>

                        {renderPredictButton()}

                        {abTestResults.original && abTestResults.modified && (
                            <Button
                                variant="outline"
                                onClick={runABTest}
                                className="flex items-center space-x-1"
                            >
                                <BarChart4 size={16}/>
                                <span>更新對比</span>
                            </Button>
                        )}
                    </div>

                    {/* 顯示預測結果和特徵重要性 */}
                    {prediction && (
                        <div className="mt-8 space-y-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-medium text-green-800">預測結果</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">
                                        閾值: {prediction.current_model_params?.threshold 
                                            ? (prediction.current_model_params.threshold * 100).toFixed(0) + '%' 
                                            : '50%'}
                                    </span>
                                    <div className={`px-3 py-1 rounded-full text-white font-medium ${prediction.prediction === 1 ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {prediction.prediction === 1 ? '可能購買' : '不太可能購買'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex justify-center items-center space-x-8 py-2">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-indigo-600">
                                        {(prediction.probability * 100).toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        購買概率
                                        {prediction.probability < (prediction.current_model_params?.threshold || 0.5) && 
                                        <span className="text-xs text-red-500 block">
                                            (低於閾值 {((prediction.current_model_params?.threshold || 0.5) * 100).toFixed(0)}%)
                                        </span>
                                        }
                                    </div>
                                </div>
                                
                                <div className="h-16 w-px bg-gray-300"></div>
                                
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-amber-600">
                                        {prediction.prediction === 1 ? '正面' : '負面'}
                                    </div>
                                    <div className="text-sm text-gray-600">預測結果</div>
                                </div>
                            </div>
                            
                            {renderFeatureImportance()}
                        </div>
                    )}

                    {/* 顯示模型參數面板 */}
                    {showModelParams && renderModelParamsPanel()}

                    {/* 顯示參數對比結果 */}
                    {abTestResults.original && abTestResults.modified && renderABTestComparison()}
                </CardContent>
                <CardFooter
                    className="text-sm text-gray-500 flex justify-center bg-gradient-to-r from-gray-50 to-gray-100 border-t">
                    <div className="flex items-center space-x-2">
                        <Users size={16} className="text-indigo-500"/>
                        <span>調整客戶特徵，觀察對預測結果的影響</span>
                    </div>
                </CardFooter>
            </Card>

            {/* 添加模态窗口 */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalContent.title}
            >
                {modalContent.content}
            </Modal>

            {/* 添加错误提示 */}
            {error && (
                <div
                    className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md shadow-md">
                    <div className="flex items-center">
                        <div className="py-1">
                            <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg"
                                 viewBox="0 0 20 20">
                                <path
                                    d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold">錯誤</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <div className="ml-auto">
                            <button
                                onClick={() => setError(null)}
                                className="text-red-700 hover:text-red-900"
                            >
                                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round"
                                     strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveModelDemo; 