"""
默認配置文件
包含應用的基本配置設置
"""

import os
from pathlib import Path

# 項目根目錄
BASE_DIR = Path(__file__).resolve().parent.parent

# 環境設置
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ENV = os.environ.get('FLASK_ENV', 'development')

# API設置
API_PREFIX = '/api'
API_VERSION = 'v1'

# 調試模式
DEBUG = True

# 密鑰
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_key_for_development')

# 跨域設置
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

# 數據目錄
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'archive_data')

# 模型目錄
MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'ml_models')
MODEL_PATH = os.environ.get('MODEL_PATH', os.path.join(MODEL_DIR, 'xgboost_model.pkl'))
THRESHOLD = float(os.environ.get('PREDICTION_THRESHOLD', '0.45'))  # 預設閾值

# 上傳目錄
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'uploads')

# 創建必要的目錄
for directory in [DATA_DIR, MODEL_DIR, UPLOAD_DIR]:
    os.makedirs(directory, exist_ok=True)

# 日誌設置
LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO')
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# 緩存設置
CACHE_TYPE = os.environ.get('CACHE_TYPE', 'SimpleCache')
CACHE_DEFAULT_TIMEOUT = int(os.environ.get('CACHE_DEFAULT_TIMEOUT', '300'))  # 5分鐘

# 定義標籤映射，用於處理分類變量
GENDER_MAP = {'Male': 0, 'Female': 1}
VEHICLE_AGE_MAP = {'< 1 Year': 0, '1-2 Year': 1, '> 2 Years': 2}
VEHICLE_DAMAGE_MAP = {'No': 0, 'Yes': 1}

# 特徵列表
FEATURES = [
    'gender',
    'age',
    'driving_license',
    'region_code',
    'previously_insured',
    'vehicle_age',
    'vehicle_damage',
    'annual_premium',
    'policy_sales_channel',
    'vintage'
]

# 派生特徵
DERIVED_FEATURES = [
    'age_group',
    'annual_premium_log'
]

# API響應狀態碼
class StatusCode:
    SUCCESS = 200
    CREATED = 201
    BAD_REQUEST = 400
    UNAUTHORIZED = 401
    FORBIDDEN = 403
    NOT_FOUND = 404
    METHOD_NOT_ALLOWED = 405
    INTERNAL_SERVER_ERROR = 500 