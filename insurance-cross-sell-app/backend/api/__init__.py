"""
API包初始化文件
"""

# API模組初始化

from flask import Blueprint

from .auth import auth_bp
from .prediction import prediction_bp
from .user import user_bp

def register_blueprints(app):
    """
    註冊所有藍圖
    
    Args:
        app: Flask應用實例
    """
    # 創建API主藍圖
    api_bp = Blueprint('api', __name__, url_prefix='/api')
    
    # 註冊子藍圖
    api_bp.register_blueprint(auth_bp, url_prefix='/auth')
    api_bp.register_blueprint(prediction_bp, url_prefix='/predictions')
    api_bp.register_blueprint(user_bp, url_prefix='/users')
    
    # 註冊主藍圖到應用
    app.register_blueprint(api_bp)
