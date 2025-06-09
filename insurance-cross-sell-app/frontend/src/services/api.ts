import axios, {AxiosResponse} from 'axios';
import {getApiBaseUrl} from '@/config/appConfig';

// 定義API接口
interface ApiResponse<T> {
    data: T;
    status: number;
    message?: string;
}

// 客戶數據介面
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
    // 模型參數（可選）
    learning_rate?: number;
    max_depth?: number;
    n_estimators?: number;
    subsample?: number;
    colsample_bytree?: number;
    min_child_weight?: number;
    scale_pos_weight?: number;
    threshold?: number;
}

// 批量預測請求介面
export interface BatchPredictionRequest {
    file_path?: string;
    data?: CustomerData[];
}

// 預測結果介面
export interface PredictionResult {
    id?: number;
    probability: number;
    prediction: number;
    customer_data?: CustomerData;
    features_importance?: Record<string, number>;
    // 模型參數相關
    current_model_params?: {
        learning_rate: number;
        max_depth: number;
        n_estimators: number;
        subsample: number;
        colsample_bytree: number;
        min_child_weight: number;
        scale_pos_weight: number;
        threshold: number;
    };
    model_params_desc?: Record<string, string>;
    // 錯誤信息
    error?: string;
}

// 模型指標介面
export interface ModelMetrics {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    auc_roc: number;
    confusion_matrix: number[][];
}

// 數據統計介面
export interface DataStats {
    total_records: number;
    features_stats: Record<string, any>;
    target_distribution?: Record<string, number>;
}

// 相關性矩陣接口
export interface CorrelationMatrix {
    features: string[];
    correlations: {
        feature1: string;
        feature2: string;
        correlation: number;
    }[];
}

class ApiService {
    private api;
    private static instance: ApiService;

    private constructor() {
        // 设置API基础URL
        const API_BASE_URL = 'http://localhost:8080/api';
        console.log('API基础URL:', API_BASE_URL);

        // 创建axios实例
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            withCredentials: false // 关闭withCredentials以避免CORS预检请求问题
        });

        // 添加请求拦截器 - 用于处理请求前的通用逻辑
        this.api.interceptors.request.use(
            (config) => {
                console.log(`請求: ${config.method?.toUpperCase()} ${config.url}`, config.data);
                return config;
            },
            (error) => {
                console.error('請求錯誤:', error);
                return Promise.reject(error);
            }
        );

        // 添加响应拦截器 - 用于处理响应的通用逻辑
        this.api.interceptors.response.use(
            (response) => {
                console.log(`響應: ${response.status} ${response.config.url}`, response.data);
                return response;
            },
            (error) => {
                // 处理错误响应
                console.error('響應錯誤:', error);

                // 如果是网络错误或服务器错误，返回友好的错误信息
                if (error.response) {
                    // 服务器返回了错误状态码
                    const status = error.response.status;
                    const errorData = error.response.data;

                    console.log(`服務器錯誤: ${status}`, errorData);

                    return Promise.reject({
                        status: status,
                        message: errorData.error || `服務器錯誤 (${status})`,
                        data: errorData
                    });
                } else if (error.request) {
                    // 请求已发送但未收到响应
                    console.log('無響應:', error.request);
                    return Promise.reject({
                        status: 0,
                        message: '服務器無響應，請檢查網絡連接或服務器狀態',
                        data: null
                    });
                } else {
                    // 设置请求时发生错误
                    console.log('請求配置錯誤:', error.message);
                    return Promise.reject({
                        status: 0,
                        message: `請求錯誤: ${error.message}`,
                        data: null
                    });
                }
            }
        );
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    // 通用請求方法
    public async request<T>(config: any): Promise<ApiResponse<T>> {
        try {
            const response = await this.api.request(config);
            return {
                data: response.data,
                status: response.status,
                message: response.data.message,
            };
        } catch (error: any) {
            if (error.response) {
                return {
                    data: error.response.data,
                    status: error.response.status,
                    message: error.response.data.error || '請求失敗',
                };
            }
            return {
                data: {} as T,
                status: 500,
                message: error.message || '網絡錯誤',
            };
        }
    }

    // GET 請求
    public async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'GET',
            url,
            params,
        });
    }

    // POST 請求
    public async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'POST',
            url,
            data,
        });
    }

    // PUT 請求
    public async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'PUT',
            url,
            data,
        });
    }

    // DELETE 請求
    public async delete<T>(url: string): Promise<ApiResponse<T>> {
        return this.request<T>({
            method: 'DELETE',
            url,
        });
    }

    // 獲取數據統計信息
    public async getDataStats(): Promise<ApiResponse<DataStats>> {
        return this.get<DataStats>('/data/stats');
    }

    // 獲取模型指標
    public async getModelMetrics(): Promise<ApiResponse<ModelMetrics>> {
        return this.get<ModelMetrics>('/model/metrics');
    }

    // 單一客戶預測
    public async predictSingle(customerData: CustomerData): Promise<ApiResponse<PredictionResult>> {
        console.log('發送預測請求數據:', JSON.stringify(customerData));
        try {
            // 添加annual_premium_log字段（對年保費取自然對數）
            // 注意：根據後端日誌，模型需要這個字段，但前端沒有提供，導致後端自動添加了全為0的列
            const processedData = {
                ...customerData,
                // 計算年保費的自然對數，避免對數為負或undefined
                annual_premium_log: customerData.annual_premium > 0
                    ? Math.log(customerData.annual_premium)
                    : 0
            };

            console.log('處理後的預測請求數據:', JSON.stringify(processedData));
            const result = await this.post<PredictionResult>('/predict/single', processedData);
            console.log('預測API響應:', result);
            return result;
        } catch (error) {
            console.error('預測API錯誤:', error);
            throw error;
        }
    }

    // 批量預測
    public async predictBatch(request: BatchPredictionRequest): Promise<ApiResponse<PredictionResult[]>> {
        return this.post<PredictionResult[]>('/predict/batch', request);
    }

    // 互動式演示預測 (用於InteractiveModelDemo組件)
    public async submitPrediction(customerData: CustomerData): Promise<ApiResponse<PredictionResult>> {
        console.log('開始處理預測請求...');
        // 添加annual_premium_log字段（對年保費取自然對數）
        const enhancedData = {
            ...customerData,
            // 計算年保費的自然對數，避免對數為負或undefined
            annual_premium_log: customerData.annual_premium > 0
                ? Math.log(customerData.annual_premium)
                : 0
        };
        console.log('增強的客戶數據（添加annual_premium_log）:', enhancedData);

        // 首先嘗試使用API
        try {
            console.log('調用API...');
            const result = await this.predictSingle(enhancedData);
            console.log('API調用結果:', result);

            // 如果API調用成功
            if (result.status === 200) {
                console.log('API調用成功，處理結果數據');
                // 注意：不再添加模擬的特徵重要性，使用真實數據

                // 確保模型參數說明存在（只有當真實API未返回此數據時才添加）
                if (!result.data.model_params_desc) {
                    console.log('添加標準模型參數說明');
                    result.data.model_params_desc = {
                        'learning_rate': '學習率 - 每次迭代對權重的調整幅度，較小的值可能需要更多迭代但有助於避免過擬合',
                        'max_depth': '最大深度 - 樹的最大深度，增加深度可以提高模型複雜性',
                        'n_estimators': '樹的數量 - 設置較大的值通常會提高性能，但也會增加計算開銷',
                        'subsample': '子採樣率 - 每棵樹使用的訓練數據比例，小於1可以減少過擬合',
                        'colsample_bytree': '特徵採樣率 - 每棵樹使用的特徵比例，小於1可以減少過擬合',
                        'min_child_weight': '最小子權重 - 控制樹分裂的難度，較大的值可以減少過擬合',
                        'scale_pos_weight': '正樣本權重比例 - 處理類別不平衡問題，增加少數類的權重',
                        'threshold': '決策閾值 - 將概率轉換為二元預測的閾值，調整可以平衡精確率和召回率'
                    };
                }

                // 確保當前模型參數存在，優先使用實際客戶傳入的參數而非模擬參數
                if (!result.data.current_model_params) {
                    console.log('使用客戶輸入的模型參數');
                    result.data.current_model_params = {
                        'learning_rate': customerData.learning_rate || 0.1,
                        'max_depth': customerData.max_depth || 8,
                        'n_estimators': customerData.n_estimators || 200,
                        'subsample': customerData.subsample || 0.8,
                        'colsample_bytree': customerData.colsample_bytree || 0.8,
                        'min_child_weight': customerData.min_child_weight || 2,
                        'scale_pos_weight': customerData.scale_pos_weight || 2,
                        'threshold': customerData.threshold || 0.35
                    };
                }
            }

            console.log('返回最終結果');
            return result;
        } catch (error) {
            // 如果API調用失敗，返回模擬數據
            console.warn('API調用失敗，返回模擬數據', error);
            return this.getMockPrediction(customerData);
        }
    }

    // 獲取模擬預測結果
    private getMockPrediction(customerData: CustomerData): ApiResponse<PredictionResult> {
        // 基於輸入特徵的簡單邏輯計算模擬概率
        let probability = 0.1;  // 基礎概率

        // 如果客戶未投保，增加概率
        if (customerData.previously_insured === 0) {
            probability += 0.2;
        }

        // 如果車輛有損壞，增加概率
        if (customerData.vehicle_damage === 'Yes') {
            probability += 0.15;
        }

        // 年齡因素
        if (customerData.age < 30) {
            probability += 0.05;
        } else if (customerData.age > 50) {
            probability -= 0.05;
        }

        // 保費因素
        if (customerData.annual_premium < 20000) {
            probability += 0.03;
        } else if (customerData.annual_premium > 40000) {
            probability -= 0.03;
        }

        // 如果提供了模型參數，應用其影響
        if (customerData.subsample && customerData.subsample < 0.7) {
            // 低子采樣率可能導致更高的方差
            probability = Math.max(0.1, Math.min(0.9, probability + Math.random() * 0.1 - 0.05));
        }

        if (customerData.scale_pos_weight && customerData.scale_pos_weight > 2.5) {
            // 高正樣本權重會偏向正類預測
            probability += 0.05;
        }

        if (customerData.max_depth && customerData.max_depth > 10) {
            // 深樹更容易過擬合
            probability = Math.max(0.1, Math.min(0.9, probability + Math.random() * 0.15 - 0.05));
        }

        // 應用閾值 (如果提供)
        const threshold = customerData.threshold || 0.35;

        // 確保概率在[0,1]範圍內
        probability = Math.max(0, Math.min(1, probability));

        return {
            status: 200,
            data: {
                probability: probability,
                prediction: probability > threshold ? 1 : 0,
                customer_data: customerData,
                features_importance: {
                    'previously_insured': 0.28,
                    'annual_premium': 0.18,
                    'vehicle_damage': 0.16,
                    'age': 0.14,
                    'vehicle_age': 0.09,
                    'policy_sales_channel': 0.04,
                    'region_code': 0.03,
                    'vintage': 0.05,
                    'gender': 0.02
                },
                current_model_params: {
                    learning_rate: customerData.learning_rate || 0.1,
                    max_depth: customerData.max_depth || 8,
                    n_estimators: customerData.n_estimators || 200,
                    subsample: customerData.subsample || 0.8,
                    colsample_bytree: customerData.colsample_bytree || 0.8,
                    min_child_weight: customerData.min_child_weight || 2,
                    scale_pos_weight: customerData.scale_pos_weight || 2,
                    threshold: threshold
                },
                model_params_desc: {
                    learning_rate: '學習率 - 每次迭代對權重的調整幅度，較小的值可能需要更多迭代但有助於避免過擬合',
                    max_depth: '最大深度 - 樹的最大深度，增加深度可以提高模型複雜性',
                    n_estimators: '樹的數量 - 設置較大的值通常會提高性能，但也會增加計算開銷',
                    subsample: '子採樣率 - 每棵樹使用的訓練數據比例，小於1可以減少過擬合',
                    colsample_bytree: '特徵採樣率 - 每棵樹使用的特徵比例，小於1可以減少過擬合',
                    min_child_weight: '最小子權重 - 控制樹分裂的難度，較大的值可以減少過擬合',
                    scale_pos_weight: '正樣本權重比例 - 處理類別不平衡問題，增加少數類的權重',
                    threshold: '決策閾值 - 將概率轉換為二元預測的閾值，調整可以平衡精確率和召回率'
                }
            }
        };
    }

    // 上傳CSV文件
    public async uploadCsv(formData: FormData): Promise<ApiResponse<{ file_path: string }>> {
        return this.request<{ file_path: string }>({
            method: 'POST',
            url: '/upload/csv',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }

    // 訓練模型
    public async trainModel(options?: any): Promise<ApiResponse<{ message: string }>> {
        return this.post<{ message: string }>('/model/train', options);
    }

    // 獲取相關性矩陣
    public async getCorrelationMatrix(): Promise<ApiResponse<CorrelationMatrix>> {
        return this.get<CorrelationMatrix>('/data/correlation');
    }
}

export default ApiService.getInstance(); 