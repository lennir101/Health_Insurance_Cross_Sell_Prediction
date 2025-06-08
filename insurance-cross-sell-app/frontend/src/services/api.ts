import axios from 'axios';

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
  customer_data: CustomerData;
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

class ApiService {
  private api;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 請求攔截器
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 響應攔截器
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // 未授權，重定向到登錄頁面
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
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
    return this.post<PredictionResult>('/predict/single', customerData);
  }

  // 批量預測
  public async predictBatch(request: BatchPredictionRequest): Promise<ApiResponse<PredictionResult[]>> {
    return this.post<PredictionResult[]>('/predict/batch', request);
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
}

export default ApiService.getInstance(); 