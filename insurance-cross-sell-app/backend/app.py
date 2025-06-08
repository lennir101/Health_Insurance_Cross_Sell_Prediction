from flask import Flask, jsonify
from flask_cors import CORS
import os
import logging
import argparse

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_app(config_name=None):
    """
    創建並配置Flask應用
    
    Args:
        config_name: 配置名稱，可選
        
    Returns:
        Flask應用實例
    """
    app = Flask(__name__)
    
    # 配置應用
    app.config.from_object('config.default')
    
    # 根據環境配置
    if config_name:
        app.config.from_object(f'config.{config_name}')
    else:
        env = os.environ.get('FLASK_ENV', 'development')
        app.config.from_object(f'config.{env}')
    
    # 啟用CORS
    CORS(app, resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}})
    
    # 註冊藍圖
    from api.routes import api_bp
    app.register_blueprint(api_bp)
    
    # 首頁路由
    @app.route('/')
    def index():
        return jsonify({
            "message": "健康保險交叉銷售預測 API",
            "version": "1.0.0",
            "endpoints": [
                "/api/data/stats",
                "/api/model/metrics",
                "/api/predict/single",
                "/api/predict/batch",
                "/api/upload/csv",
                "/api/model/train",
                "/api/model/threshold"
            ]
        })
    
    # 404錯誤處理
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "不存在的API端點"}), 404
    
    # 500錯誤處理
    @app.errorhandler(500)
    def server_error(error):
        logger.error(f"服務器錯誤: {str(error)}")
        return jsonify({"error": "服務器內部錯誤"}), 500
    
    logger.info(f"應用已創建，環境: {os.environ.get('FLASK_ENV', 'development')}")
    
    return app

# 如果直接運行此文件，則創建應用
if __name__ == '__main__':
    # 創建參數解析器
    parser = argparse.ArgumentParser(description='啟動健康保險交叉銷售預測 API 服務')
    parser.add_argument('--port', type=int, default=5000, help='API 服務端口號')
    args = parser.parse_args()
    
    app = create_app()
    app.run(host='0.0.0.0', port=args.port, debug=True) 