from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from core.database import db


class User(db.Model):
    """
    用戶模型
    """
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 與預測記錄的關係
    predictions = db.relationship('Prediction', backref='user', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

    def set_password(self, password):
        """設置密碼"""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        """驗證密碼"""
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'is_admin': self.is_admin,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
