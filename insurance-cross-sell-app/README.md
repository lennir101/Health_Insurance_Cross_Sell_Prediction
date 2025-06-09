# 健康保險交叉銷售預測系統

這是一個基於機器學習的健康保險交叉銷售預測系統，通過分析客戶的各種特徵，預測客戶對車險產品的購買意願，幫助保險公司進行精準營銷。

## 功能特點

- **數據可視化儀表板**：展示數據分佈、模型性能和預測結果的多維度視圖
- **單一客戶預測**：輸入客戶資料，獲取購買意願的預測結果和特徵影響因素
- **批量預測功能**：支持上傳CSV文件進行批量客戶預測
- **模型指標分析**：提供模型性能指標，包括精確率、召回率、混淆矩陣等
- **特徵重要性分析**：展示各特徵對預測結果的影響程度
- **閾值分析**：不同決策閾值下的模型表現分析

## 技術架構

### 前端

- React 18 框架
- TypeScript 支持
- Tailwind CSS 樣式系統
- Recharts 數據可視化庫
- Axios HTTP 請求庫
- React Router 路由管理

### 後端

- Flask RESTful API 框架
- Pydantic 數據驗證
- Scikit-learn 機器學習模型
- Pandas 數據處理
- NumPy 數學計算

## 系統架構

系統由以下主要模塊組成：

1. **前端展示層**：負責用戶交互和數據展示
    - 儀表板頁面：數據分析和可視化
    - 預測頁面：單一客戶預測功能
    - 批量預測頁面：批量數據處理功能

2. **後端服務層**：提供API接口和業務邏輯
    - 預測服務：處理預測請求和返回結果
    - 數據處理：數據清洗和特徵處理
    - 模型加載：懶加載模型以提高性能

3. **機器學習層**：提供預測模型和分析功能
    - 訓練好的分類模型
    - 特徵重要性分析
    - 模型評估指標

## 快速開始

### 前端部署

1. 安裝依賴：

```bash
cd frontend
npm install
```

2. 啟動開發服務器：

```bash
npm run dev
```

3. 構建生產版本：

```bash
npm run build
```

### 後端部署

1. 安裝依賴：

```bash
cd backend
pip install -r requirements.txt
```

2. 啟動開發服務器：

```bash
python app.py
```

3. 使用生產服務器（生產環境）：

```bash
gunicorn app:app
```

## API 文檔

系統提供以下主要API端點：

- `POST /api/predict`：單一客戶預測
- `POST /api/predict/batch`：批量客戶預測
- `GET /api/model/metrics`：獲取模型性能指標
- `GET /api/model/feature-importance`：獲取特徵重要性
- `GET /api/model/threshold-analysis`：獲取閾值分析
- `GET /api/statistics`：獲取數據統計信息

詳細API文檔可通過啟動後端服務後訪問 `/api/docs` 路徑查看。

## 數據格式

### 客戶數據字段說明

- `gender`：客戶性別 ('Male'/'Female')
- `age`：客戶年齡 (18-100)
- `driving_license`：是否有駕照 (0/1)
- `region_code`：客戶所在地區代碼
- `previously_insured`：是否已有保險 (0/1)
- `vehicle_age`：車輛年齡 ('< 1 Year'/'1-2 Year'/'> 2 Years')
- `vehicle_damage`：車輛是否損壞過 ('Yes'/'No')
- `annual_premium`：年保費
- `policy_sales_channel`：保單銷售渠道代碼
- `vintage`：客戶與公司關係時長（天）

## 開發者指南

### 目錄結構

```
insurance-cross-sell-app/
├── frontend/                   # 前端項目
│   ├── src/                    # 源代碼
│   │   ├── components/         # UI組件
│   │   ├── pages/              # 頁面組件
│   │   ├── services/           # API服務
│   │   └── ...
│   ├── public/                 # 靜態資源
│   └── package.json            # 依賴配置
├── backend/                    # 後端項目
│   ├── api/                    # API端點
│   ├── services/               # 業務服務
│   ├── utils/                  # 工具函數
│   ├── config/                 # 配置文件
│   └── app.py                  # 應用入口
└── README.md                   # 項目說明
```

## 許可證

MIT License

## 配置系統

本系統支持自定義配置，包括前後端端口設置。這些配置存儲在單獨的配置文件中，方便用戶修改。

### 前端配置

前端配置文件位於 `frontend/src/config/appConfig.ts`，包含以下主要設置：

```typescript
export const API_CONFIG = {
    BACKEND_HOST: 'http://localhost', // 後端主機地址
    BACKEND_PORT: 8080,               // 後端端口
    API_PREFIX: '/api'                // API路徑前綴
};

export const APP_CONFIG = {
    APP_NAME: '保險交叉銷售預測系統',
    DEFAULT_THEME: 'light'            // 默認主題 ('light' | 'dark' | 'system')
};
```

### 後端配置

後端配置文件位於 `backend/config/server_config.py`，包含以下主要設置：

```python
SERVER_CONFIG = {
    'HOST': '0.0.0.0',  # 監聽所有網絡接口
    'PORT': 8080,  # 服務器端口
    'DEBUG': True  # 調試模式
}

CORS_CONFIG = {
    'ORIGINS': '*'  # 允許的跨域來源
}
```

### 啟動系統

我們提供了方便的啟動腳本：

- **Linux/macOS**：使用 `./start.sh`
- **Windows**：使用 `start.bat`

這些腳本提供以下選項：

1. 啟動後端服務
2. 啟動前端開發服務器
3. 同時啟動前後端服務
4. 退出

### 端口修改注意事項

1. 修改後端端口時，需要同時更新前後端配置：
    - 更新 `backend/config/server_config.py` 中的 `PORT` 值
    - 更新 `frontend/src/config/appConfig.ts` 中的 `BACKEND_PORT` 值

2. macOS 用戶注意：系統的 AirPlay 服務會佔用 5000 端口，如果使用此端口，請先禁用 AirPlay 或選擇其他端口。

3. 確保選擇的端口未被其他應用程式使用。 