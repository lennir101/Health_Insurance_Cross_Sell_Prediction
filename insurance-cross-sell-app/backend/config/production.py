import os
from datetime import timedelta

# 生產環境配置文件
DEBUG = False

# 生產環境日誌級別
LOG_LEVEL = 'INFO'


class ProductionConfig:
    """
    生產環境配置
    """
    # 基本配置
    DEBUG = False
    TESTING = False
    SECRET_KEY = os.environ.get("SECRET_KEY", "change_this_in_production")

    # 數據庫配置
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL", "sqlite:///insurance_app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # JWT配置
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change_this_in_production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # 模型配置
    MODEL_PATH = os.environ.get("MODEL_PATH",
                                os.path.join(os.path.abspath(os.path.dirname(__file__)), '..',
                                             'ml_models/final_model.joblib'))
    LABEL_ENCODERS_PATH = os.environ.get("LABEL_ENCODERS_PATH",
                                         os.path.join(os.path.abspath(os.path.dirname(__file__)), '..',
                                                      'ml_models/label_encoders.joblib'))

    # 預測閾值
    PREDICTION_THRESHOLD = float(os.environ.get("PREDICTION_THRESHOLD", "0.3329736384164349"))  # 從最佳模型參數中獲取 

    LOG_LEVEL = 'INFO'
