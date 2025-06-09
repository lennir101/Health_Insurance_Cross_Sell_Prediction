import api from './api';

// 客戶保險預測數據接口
export interface CustomerData {
    id?: number;
    gender: string;
    age: number;
    driving_license: number;
    region_code: number;
    previously_insured: number;
    vehicle_age: string;
    vehicle_damage: string;
    annual_premium: number;
    policy_sales_channel: number;
    vintage: number;
}

// 預測結果接口
export interface PredictionResult {
    prediction: number;
    probability: number;
    features_importance: Record<string, number>;
    threshold: number;
}

// 批量預測結果接口
export interface BatchPredictionResult {
    predictions: Array<{
        id: number;
        prediction: number;
        probability: number;
    }>;
    success_count: number;
    total_count: number;
}

// 模型指標接口
export interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
}

// 統計資料接口
export interface StatisticsData {
    feature_distributions: Record<string, any>;
    correlation_matrix: Record<string, Record<string, number>>;
    age_group_stats: Array<{
        group: string;
        count: number;
        avg_premium: number;
        response_rate: number;
    }>;
    vehicle_stats: {
        age_distribution: Record<string, number>;
        damage_distribution: Record<string, number>;
    };
}

class PredictionService {
    // 單一客戶預測
    async predictSingle(customerData: CustomerData): Promise<PredictionResult> {
        const response = await api.post<PredictionResult>('/predict', customerData);
        return response.data;
    }

    // 批量預測
    async predictBatch(customersData: CustomerData[]): Promise<BatchPredictionResult> {
        const response = await api.post<BatchPredictionResult>('/predict/batch', {customers: customersData});
        return response.data;
    }

    // 獲取模型性能指標
    async getModelMetrics(): Promise<ModelMetrics> {
        const response = await api.get<ModelMetrics>('/model/metrics');
        return response.data;
    }

    // 獲取統計資料
    async getStatistics(): Promise<StatisticsData> {
        const response = await api.get<StatisticsData>('/statistics');
        return response.data;
    }

    // 模型閾值分析
    async getThresholdAnalysis(): Promise<Array<{ threshold: number; precision: number; recall: number; f1: number }>> {
        const response = await api.get<Array<{
            threshold: number;
            precision: number;
            recall: number;
            f1: number
        }>>('/model/threshold-analysis');
        return response.data;
    }

    // 特徵重要性
    async getFeatureImportance(): Promise<Record<string, number>> {
        const response = await api.get<Record<string, number>>('/model/feature-importance');
        return response.data;
    }
}

export default new PredictionService(); 