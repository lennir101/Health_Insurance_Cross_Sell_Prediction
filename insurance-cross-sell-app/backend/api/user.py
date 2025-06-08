from flask import Blueprint, request, jsonify
from core.auth import jwt_required, admin_required
from services.user_service import get_user_by_id, update_user
from models.user import User

user_bp = Blueprint('user', __name__)

@user_bp.route('', methods=['GET'])
@admin_required
def get_users():
    """
    獲取所有用戶（僅管理員可訪問）
    """
    users = User.query.all()
    return jsonify({
        "users": [user.to_dict() for user in users],
        "count": len(users)
    }), 200

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required
def get_user(user_id):
    """
    獲取指定用戶
    """
    # 檢查權限（只能查看自己或管理員可查看所有）
    if request.user_id != user_id:
        # 檢查當前用戶是否為管理員
        current_user = get_user_by_id(request.user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({"error": "無權訪問"}), 403
    
    user = get_user_by_id(user_id)
    
    if not user:
        return jsonify({"error": "用戶不存在"}), 404
    
    return jsonify({
        "user": user.to_dict()
    }), 200

@user_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required
def update(user_id):
    """
    更新用戶信息
    """
    # 檢查權限（只能更新自己或管理員可更新所有）
    if request.user_id != user_id:
        # 檢查當前用戶是否為管理員
        current_user = get_user_by_id(request.user_id)
        if not current_user or not current_user.is_admin:
            return jsonify({"error": "無權訪問"}), 403
    
    data = request.json
    
    if not data:
        return jsonify({"error": "無效的數據"}), 400
    
    # 更新用戶
    user, error = update_user(user_id, data)
    
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify({
        "message": "更新成功",
        "user": user.to_dict()
    }), 200

@user_bp.route('/<int:user_id>/admin', methods=['PUT'])
@admin_required
def toggle_admin(user_id):
    """
    切換用戶的管理員狀態（僅管理員可訪問）
    """
    user = get_user_by_id(user_id)
    
    if not user:
        return jsonify({"error": "用戶不存在"}), 404
    
    # 檢查是否是最後一個管理員
    if user.is_admin and User.query.filter_by(is_admin=True).count() <= 1:
        return jsonify({"error": "不能移除最後一個管理員"}), 400
    
    # 切換管理員狀態
    user.is_admin = not user.is_admin
    from core.database import db
    db.session.commit()
    
    return jsonify({
        "message": f"用戶 {user.username} 管理員狀態已更改為 {user.is_admin}",
        "user": user.to_dict()
    }), 200 