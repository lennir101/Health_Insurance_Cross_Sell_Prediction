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

# 跨域設置
CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*')

# 模型設置
MODEL_DIR = os.path.join(BASE_DIR.parent, 'models')
MODEL_PATH = os.environ.get('MODEL_PATH', os.path.join(MODEL_DIR, 'lgbm_model.pkl'))
THRESHOLD = float(os.environ.get('PREDICTION_THRESHOLD', '0.45'))  # 預設閾值

# Redis 設置
REDIS_ENABLED = os.environ.get('REDIS_ENABLED', 'True') == 'True'
REDIS_HOST = os.environ.get('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.environ.get('REDIS_PORT', '6379'))
REDIS_DB = int(os.environ.get('REDIS_DB', '0'))
REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', None)  # 如果無密碼則為 None
REDIS_TTL = int(os.environ.get('REDIS_TTL', '3600'))  # 默認緩存時間：1小時

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
