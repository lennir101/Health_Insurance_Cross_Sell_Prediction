from functools import wraps
from flask import request, jsonify, current_app
from flask_jwt_extended import (
    JWTManager, verify_jwt_in_request, get_jwt_identity
)

# 初始化JWT管理器
jwt = JWTManager()

def jwt_required(fn):
    """
    JWT驗證裝飾器
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            # 將用戶ID添加到請求對象
            request.user_id = get_jwt_identity()
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "未授權訪問", "details": str(e)}), 401
    return wrapper

def admin_required(fn):
    """
    管理員權限驗證裝飾器
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            
            # 這裡需要實現檢查用戶是否是管理員的邏輯
            # 從數據庫查詢用戶信息
            from backend.models.user import User
            user = User.query.get(user_id)
            
            if not user or not user.is_admin:
                return jsonify({"error": "需要管理員權限"}), 403
            
            request.user_id = user_id
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "未授權訪問", "details": str(e)}), 401
    return wrapper

def init_auth(app):
    """
    初始化認證模塊
    """
    jwt.init_app(app) 