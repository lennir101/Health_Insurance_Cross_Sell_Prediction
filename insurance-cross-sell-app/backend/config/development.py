"""
開發環境配置文件
"""

import os
from datetime import timedelta
from .default import *

# 開發環境配置
DEBUG = True

# 開發環境日誌級別
LOG_LEVEL = 'DEBUG'

class DevelopmentConfig:
    """開發環境配置類"""
    DEBUG = True
    LOG_LEVEL = 'DEBUG'
    SECRET_KEY = 'dev_key_for_development'

    # 數據庫配置
    SQLALCHEMY_DATABASE_URI = "sqlite:///insurance_app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT配置
    JWT_SECRET_KEY = "jwt_dev_secret_key_change_in_production"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # 模型配置
    MODEL_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'ml_models/final_model.joblib')
    LABEL_ENCODERS_PATH = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'ml_models/label_encoders.joblib')
    
    # 預測閾值
    PREDICTION_THRESHOLD = 0.3329736384164349  # 從最佳模型參數中獲取 