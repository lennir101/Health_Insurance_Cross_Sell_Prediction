from flask_sqlalchemy import SQLAlchemy

# 初始化數據庫
db = SQLAlchemy()

def init_db(app):
    """
    初始化數據庫連接
    """
    db.init_app(app)
    
    with app.app_context():
        # 創建所有表
        db.create_all()
        
        # 這裡可以添加初始數據
        # from backend.models.user import User
        # 檢查是否有管理員用戶，如果沒有則創建
        # if not User.query.filter_by(is_admin=True).first():
        #     admin = User(username="admin", email="admin@example.com", is_admin=True)
        #     admin.set_password("admin_password")
        #     db.session.add(admin)
        #     db.session.commit() 