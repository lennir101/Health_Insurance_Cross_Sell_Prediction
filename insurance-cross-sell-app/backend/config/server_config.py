"""
後端服務器配置文件

此文件包含後端服務器的配置參數。
用戶可以根據需要修改這些配置。
"""
import os

"""
服務器配置
-----------------

HOST: 服務器主機地址
    - '0.0.0.0' 表示監聽所有網絡接口（允許從任何 IP 訪問）
    - '127.0.0.1' 或 'localhost' 表示只允許本機訪問
    
PORT: 服務器端口號
    - 建議使用 8000 以上的端口
    - 需確保與前端配置中的 BACKEND_PORT 一致
    - 修改後需要在前端配置文件 appConfig.ts 中同步修改 BACKEND_PORT
    - 注意：某些系統可能已經佔用特定端口，如 macOS 的 AirPlay 會佔用 5000 端口
    
DEBUG: 是否啟用調試模式
    - 生產環境應設置為 False
    
"""
SERVER_CONFIG = {
    'HOST': '0.0.0.0',  # 監聽所有網絡接口
    'PORT': 8080,  # 服務器端口
    'DEBUG': True  # 調試模式
}

"""
CORS 配置
-----------------

ORIGINS: 允許的跨域來源
    - '*' 表示允許所有來源
    - 生產環境應限制為特定域名，如 'https://yourdomain.com'
"""
CORS_CONFIG = {
    'ORIGINS': ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174']
}

"""
安全配置
-----------------

SECRET_KEY: 用於會話簽名的密鑰
    - 生產環境應使用強隨機密鑰
    - 可使用 os.urandom(24).hex() 生成
"""
SECURITY_CONFIG = {
    'SECRET_KEY': os.environ.get('SECRET_KEY', 'dev_key_for_development')
}

"""
模型配置
-----------------

MODEL_TYPE: 默認模型類型
    - 可選: 'xgboost', 'random_forest', 'gradient_boosting'
    
PREDICTION_THRESHOLD: 預測閾值
    - 範圍: 0.0 - 1.0
    - 影響模型預測的敏感度
"""
MODEL_CONFIG = {
    'MODEL_TYPE': 'xgboost',
    'PREDICTION_THRESHOLD': 0.45
}
