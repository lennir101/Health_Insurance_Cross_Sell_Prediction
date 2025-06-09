from flask import Blueprint, request, jsonify
import os
import pandas as pd
from typing import Dict, Any, List
import logging
from werkzeug.utils import secure_filename
from services.data_service import DataService
from services.model_service import ModelService

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 創建藍圖
api_bp = Blueprint('api', __name__, url_prefix='/api')

# 初始化服務
data_service = DataService()
model_service = ModelService()

# 允許的文件類型
ALLOWED_EXTENSIONS = {'csv'}


def allowed_file(filename):
    """檢查文件是否為允許的類型"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@api_bp.route('/data/stats', methods=['GET'])
def get_data_stats():
    """獲取數據統計信息"""
    try:
        stats = data_service.get_data_stats()
        return jsonify(stats), 200
    except Exception as e:
        logger.error(f"獲取數據統計信息失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/model/metrics', methods=['GET'])
def get_model_metrics():
    """獲取模型評估指標"""
    try:
        metrics = model_service.evaluate()
        return jsonify(metrics), 200
    except Exception as e:
        logger.error(f"獲取模型評估指標失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/predict/single', methods=['POST'])
def predict_single():
    """單一客戶預測"""
    try:
        # 獲取請求數據
        data = request.json

        # 提取客戶特徵和模型參數
        customer_features = {}
        model_params = {}

        # 區分客戶特徵和模型參數
        if data:
            # 基本客戶特徵
            customer_features_keys = [
                'gender', 'age', 'driving_license', 'region_code',
                'previously_insured', 'vehicle_age', 'vehicle_damage',
                'annual_premium', 'policy_sales_channel', 'vintage'
            ]

            # 提取客戶特徵
            for key in customer_features_keys:
                if key in data:
                    customer_features[key] = data[key]

            # 提取模型參數 (如果存在)
            model_params_keys = [
                'learning_rate', 'max_depth', 'n_estimators',
                'subsample', 'colsample_bytree', 'min_child_weight',
                'scale_pos_weight', 'threshold'
            ]

            # 創建模型參數字典
            for key in model_params_keys:
                if key in data:
                    model_params[key] = data[key]

        # 執行預測 (傳入模型參數)
        result = model_service.predict(customer_features, model_params=model_params)

        # 添加模型參數說明
        result['model_params_desc'] = {
            'learning_rate': '學習率 - 每次迭代對權重的調整幅度，較小的值可能需要更多迭代但有助於避免過擬合',
            'max_depth': '最大深度 - 樹的最大深度，增加深度可以提高模型複雜性',
            'n_estimators': '樹的數量 - 設置較大的值通常會提高性能，但也會增加計算開銷',
            'subsample': '子採樣率 - 每棵樹使用的訓練數據比例，小於1可以減少過擬合',
            'colsample_bytree': '特徵採樣率 - 每棵樹使用的特徵比例，小於1可以減少過擬合',
            'min_child_weight': '最小子權重 - 控制樹分裂的難度，較大的值可以減少過擬合',
            'scale_pos_weight': '正樣本權重比例 - 處理類別不平衡問題，增加少數類的權重',
            'threshold': '決策閾值 - 將概率轉換為二元預測的閾值，調整可以平衡精確率和召回率'
        }

        # 添加當前使用的模型參數值
        result['current_model_params'] = {
            'learning_rate': model_service.get_param('learning_rate', 0.1),
            'max_depth': model_service.get_param('max_depth', 8),
            'n_estimators': model_service.get_param('n_estimators', 200),
            'subsample': model_service.get_param('subsample', 0.8),
            'colsample_bytree': model_service.get_param('colsample_bytree', 0.8),
            'min_child_weight': model_service.get_param('min_child_weight', 2),
            'scale_pos_weight': model_service.get_param('scale_pos_weight', 2),
            'threshold': model_service.threshold
        }

        return jsonify(result), 200
    except Exception as e:
        logger.error(f"單一預測失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/predict/batch', methods=['POST'])
def predict_batch():
    """批量預測"""
    try:
        # 獲取請求數據
        data = request.json

        # 檢查是否提供了文件路徑
        if data.get('file_path'):
            # 從文件中讀取數據
            file_path = data['file_path']

            # 驗證文件是否存在
            if not os.path.exists(file_path):
                return jsonify({"error": f"文件不存在: {file_path}"}), 400

            # 讀取文件
            df = pd.read_csv(file_path)

            # 執行批量預測
            results = model_service.batch_predict(df)

            return jsonify(results), 200

        # 檢查是否提供了數據列表
        elif data.get('data'):
            # 從JSON數據創建數據框
            df = pd.DataFrame(data['data'])

            # 執行批量預測
            results = model_service.batch_predict(df)

            return jsonify(results), 200

        else:
            return jsonify({"error": "請提供file_path或data"}), 400

    except Exception as e:
        logger.error(f"批量預測失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/upload/csv', methods=['POST'])
def upload_csv():
    """上傳CSV文件"""
    try:
        # 檢查是否有文件
        if 'file' not in request.files:
            return jsonify({"error": "未找到文件"}), 400

        file = request.files['file']

        # 檢查文件名
        if file.filename == '':
            return jsonify({"error": "未選擇文件"}), 400

        # 檢查文件類型
        if file and allowed_file(file.filename):
            # 獲取上傳目錄
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            upload_dir = os.path.join(base_dir, 'uploads')
            os.makedirs(upload_dir, exist_ok=True)

            # 保存文件
            filename = secure_filename(file.filename)
            file_path = os.path.join(upload_dir, filename)
            file.save(file_path)

            return jsonify({"file_path": file_path}), 200

        else:
            return jsonify({"error": "不支持的文件類型，僅支持CSV文件"}), 400

    except Exception as e:
        logger.error(f"上傳文件失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/model/train', methods=['POST'])
def train_model():
    """訓練模型"""
    try:
        # 獲取請求數據
        data = request.json or {}

        # 獲取模型類型
        model_type = data.get('model_type', 'xgboost')

        # 獲取模型參數
        params = data.get('params', None)

        # 創建新的模型服務
        model_service_new = ModelService(model_type=model_type)

        # 訓練模型
        result = model_service_new.train(params)

        # 尋找最佳閾值
        metric = data.get('threshold_metric', 'f1')
        threshold = model_service_new.find_optimal_threshold(metric)

        # 獲取特徵重要性
        feature_importance = model_service_new.get_feature_importance()

        # 返回結果
        response = {
            "message": f"{model_service.MODEL_TYPES[model_type]}模型訓練完成",
            "model_type": model_type,
            "threshold": threshold,
            "metrics": result['validation_metrics'],
            "feature_importance": feature_importance
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"訓練模型失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/model/threshold', methods=['POST'])
def set_threshold():
    """設置模型閾值"""
    try:
        # 獲取請求數據
        data = request.json

        # 獲取閾值
        threshold = data.get('threshold')

        if threshold is None:
            # 自動尋找最佳閾值
            metric = data.get('metric', 'f1')
            threshold = model_service.find_optimal_threshold(metric)
            message = f"已自動找到最佳閾值: {threshold:.2f}，基於指標: {metric}"
        else:
            # 手動設置閾值
            model_service.threshold = float(threshold)

            # 保存更新後的配置
            config_path = os.path.join(model_service.model_dir, f"{model_service.model_type}_config.pkl")
            import joblib
            config = {
                'feature_names': model_service.feature_names,
                'threshold': model_service.threshold,
                'model_type': model_service.model_type
            }
            joblib.dump(config, config_path)

            message = f"已手動設置閾值: {threshold:.2f}"

        # 獲取新閾值下的指標
        metrics = model_service.evaluate()

        response = {
            "message": message,
            "threshold": float(threshold),
            "metrics": metrics
        }

        return jsonify(response), 200

    except Exception as e:
        logger.error(f"設置閾值失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/health', methods=['GET'])
def health_check():
    """API 健康檢查"""
    try:
        return jsonify({
            "status": "ok",
            "message": "API 服務正常運行",
            "model_loaded": model_service.model is not None
        }), 200
    except Exception as e:
        logger.error(f"健康檢查失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500


@api_bp.route('/data/correlation', methods=['GET'])
def get_correlation_matrix():
    """獲取數值特徵之間的相關性矩陣"""
    try:
        correlation_matrix = data_service.get_correlation_matrix()
        return jsonify(correlation_matrix), 200
    except Exception as e:
        logger.error(f"獲取相關性矩陣失敗: {str(e)}")
        return jsonify({"error": str(e)}), 500
