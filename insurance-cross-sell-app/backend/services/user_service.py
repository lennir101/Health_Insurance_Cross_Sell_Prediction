from flask import current_app
from flask_jwt_extended import create_access_token, create_refresh_token
from core.database import db
from models.user import User


def register_user(username, email, password):
    """
    註冊新用戶
    
    Args:
        username (str): 用戶名
        email (str): 電子郵件
        password (str): 密碼
        
    Returns:
        tuple: (用戶對象, 錯誤信息)
    """
    # 檢查用戶名是否已存在
    if User.query.filter_by(username=username).first():
        return None, "用戶名已存在"

    # 檢查電子郵件是否已存在
    if User.query.filter_by(email=email).first():
        return None, "電子郵件已存在"

    # 創建新用戶
    user = User(username=username, email=email)
    user.set_password(password)

    # 如果是第一個用戶，設為管理員
    if User.query.count() == 0:
        user.is_admin = True

    # 保存到數據庫
    db.session.add(user)
    db.session.commit()

    return user, None


def authenticate_user(username, password):
    """
    用戶身份驗證
    
    Args:
        username (str): 用戶名
        password (str): 密碼
        
    Returns:
        tuple: (用戶對象, 訪問令牌, 刷新令牌, 錯誤信息)
    """
    # 查找用戶
    user = User.query.filter_by(username=username).first()

    # 檢查用戶是否存在及密碼是否正確
    if not user or not user.check_password(password):
        return None, None, None, "用戶名或密碼錯誤"

    # 創建訪問令牌和刷新令牌
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return user, access_token, refresh_token, None


def get_user_by_id(user_id):
    """
    根據ID獲取用戶
    
    Args:
        user_id (int): 用戶ID
        
    Returns:
        User: 用戶對象
    """
    return User.query.get(user_id)


def update_user(user_id, data):
    """
    更新用戶信息
    
    Args:
        user_id (int): 用戶ID
        data (dict): 要更新的用戶數據
        
    Returns:
        tuple: (用戶對象, 錯誤信息)
    """
    user = User.query.get(user_id)

    if not user:
        return None, "用戶不存在"

    # 更新用戶名
    if 'username' in data and data['username'] != user.username:
        # 檢查用戶名是否已存在
        if User.query.filter_by(username=data['username']).first():
            return None, "用戶名已存在"
        user.username = data['username']

    # 更新電子郵件
    if 'email' in data and data['email'] != user.email:
        # 檢查電子郵件是否已存在
        if User.query.filter_by(email=data['email']).first():
            return None, "電子郵件已存在"
        user.email = data['email']

    # 更新密碼
    if 'password' in data:
        user.set_password(data['password'])

    # 保存到數據庫
    db.session.commit()

    return user, None
