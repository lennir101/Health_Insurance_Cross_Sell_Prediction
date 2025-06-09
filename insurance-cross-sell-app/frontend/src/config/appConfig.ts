/**
 * 應用配置文件
 *
 * 此文件包含前端應用的各種配置參數。
 * 用戶可以根據需要修改這些配置。
 */

/**
 * API 配置
 *
 * BACKEND_HOST: 後端服務的主機地址，如果部署在同一台機器上，通常為 localhost
 * BACKEND_PORT: 後端服務的端口號，需與後端 app.py 中設置的端口一致
 * API_PREFIX: API 的前綴路徑
 *
 * 注意：修改 BACKEND_PORT 後，需要確保後端服務也使用相同的端口
 * 啟動後端時可以使用：python backend/app.py --port <BACKEND_PORT>
 */
export const API_CONFIG = {
    BACKEND_HOST: 'http://localhost',
    BACKEND_PORT: 8080,
    API_PREFIX: '/api'
};

/**
 * 應用通用配置
 *
 * APP_NAME: 應用名稱
 * DEFAULT_THEME: 默認主題 ('light' | 'dark' | 'system')
 */
export const APP_CONFIG = {
    APP_NAME: '保險交叉銷售預測系統',
    DEFAULT_THEME: 'light'
};

/**
 * 獲取完整的 API 基礎 URL
 *
 * 如果部署到生產環境且前後端在同一個域名下，可以將 getApiBaseUrl 修改為：
 * return API_CONFIG.API_PREFIX;
 */
export const getApiBaseUrl = (): string => {
    return `${API_CONFIG.BACKEND_HOST}:${API_CONFIG.BACKEND_PORT}${API_CONFIG.API_PREFIX}`;
};

export default {
    API_CONFIG,
    APP_CONFIG,
    getApiBaseUrl
}; 