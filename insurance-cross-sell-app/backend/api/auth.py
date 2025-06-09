from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, create_access_token
from services.user_service import authenticate_user, register_user

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    用戶註冊
    """
    data = request.json

    if not data:
        return jsonify({"error": "無效的數據"}), 400

    # 檢查必要字段
    required_fields = ['username', 'email', 'password']
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        return jsonify({"error": f"缺少必要字段: {', '.join(missing_fields)}"}), 400

    # 註冊用戶
    user, error = register_user(
        username=data['username'],
        email=data['email'],
        password=data['password']
    )

    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "message": "註冊成功",
        "user": user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    用戶登錄
    """
    data = request.json

    if not data:
        return jsonify({"error": "無效的數據"}), 400

    # 檢查必要字段
    if 'username' not in data or 'password' not in data:
        return jsonify({"error": "缺少用戶名或密碼"}), 400

    # 驗證用戶
    user, access_token, refresh_token, error = authenticate_user(
        username=data['username'],
        password=data['password']
    )

    if error:
        return jsonify({"error": error}), 401

    return jsonify({
        "message": "登錄成功",
        "user": user.to_dict(),
        "access_token": access_token,
        "refresh_token": refresh_token
    }), 200


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    刷新訪問令牌
    """
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)

    return jsonify({
        "message": "訪問令牌刷新成功",
        "access_token": access_token
    }), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """
    獲取當前用戶信息
    """
    from services.user_service import get_user_by_id

    user_id = get_jwt_identity()
    user = get_user_by_id(user_id)

    if not user:
        return jsonify({"error": "用戶不存在"}), 404

    return jsonify({
        "user": user.to_dict()
    }), 200
