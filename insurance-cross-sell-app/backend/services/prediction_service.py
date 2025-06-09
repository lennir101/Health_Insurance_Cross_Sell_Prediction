import pandas as pd
import numpy as np
import joblib
import os
import json
import pickle
import redis
import hashlib
from sklearn.preprocessing import LabelEncoder
import time

from config.settings import MODEL_PATH, THRESHOLD, REDIS_HOST, REDIS_PORT, REDIS_DB, REDIS_PASSWORD, REDIS_TTL, REDIS_ENABLED

# 初始化 Redis 連接
_redis_client = None

def get_redis_client():
    """
    獲取 Redis 連接客戶端
    """
    global _redis_client
    if _redis_client is None and REDIS_ENABLED:
        try:
            _redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                password=REDIS_PASSWORD,
                decode_responses=False,
                socket_timeout=5
            )
            # 測試連接
            _redis_client.ping()
        except Exception as e:
            print(f"無法連接到 Redis: {str(e)}")
            _redis_client = None
    return _redis_client

# 全局變量
_model = None
_feature_importances = None


def _load_model():
    """
    懶加載模型，優先從 Redis 緩存中加載
    """
    global _model, _feature_importances
    
    # 檢查 Redis 中是否有模型
    redis_client = get_redis_client()
    if redis_client:
        try:
            # 嘗試從 Redis 加載特徵重要性
            cached_importances = redis_client.get('model:feature_importances')
            if cached_importances:
                _feature_importances = pickle.loads(cached_importances)
                print("從 Redis 緩存加載特徵重要性")
        except Exception as e:
            print(f"從 Redis 加載特徵重要性失敗: {str(e)}")

    # 如果模型或特徵重要性未從 Redis 加載，則從文件加載
    if _model is None:
        try:
            # 從保存的模型文件中加載
            _model = joblib.load(MODEL_PATH)

            # 如果模型有feature_importances_屬性，則提取特徵重要性
            if hasattr(_model, 'feature_importances_'):
                _feature_importances = _model.feature_importances_
            elif hasattr(_model, 'feature_importance_'):
                _feature_importances = _model.feature_importance_
            else:
                # 如果模型沒有特徵重要性屬性，創建一個示例
                _feature_importances = np.array([0.145, 0.176, 0.284, 0.158, 0.092, 0.049, 0.021, 0.032, 0.043])
            
            # 將特徵重要性保存到 Redis
            if redis_client and _feature_importances is not None:
                try:
                    redis_client.setex(
                        'model:feature_importances',
                        REDIS_TTL,
                        pickle.dumps(_feature_importances)
                    )
                    print("特徵重要性已保存到 Redis 緩存")
                except Exception as e:
                    print(f"保存特徵重要性到 Redis 失敗: {str(e)}")
                    
        except Exception as e:
            # 如果無法加載模型，使用示例數據（用於開發和測試）
            print(f"警告: 無法加載模型，使用示例預測 ({str(e)})")
            _model = "dummy_model"
            _feature_importances = np.array([0.145, 0.176, 0.284, 0.158, 0.092, 0.049, 0.021, 0.032, 0.043])


def make_prediction(data):
    """
    對預處理後的數據進行預測，優先從 Redis 緩存中獲取結果
    
    Args:
        data: 預處理後的特徵數據
        
    Returns:
        (probability, prediction): 預測概率和預測結果的元組
    """
    # 生成輸入數據的緩存鍵
    input_hash = hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()
    cache_key = f'prediction:{input_hash}'
    
    # 嘗試從 Redis 緩存中獲取結果
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                probability, prediction = pickle.loads(cached_result)
                print(f"從 Redis 緩存獲取預測結果: {probability}, {prediction}")
                return probability, prediction
        except Exception as e:
            print(f"從 Redis 獲取預測結果失敗: {str(e)}")
    
    # 如果緩存中沒有，加載模型並進行預測
    _load_model()

    # 如果是開發環境中的示例模型，返回示例預測
    if _model == "dummy_model":
        # 生成一個偽隨機概率，基於輸入特徵
        seed = sum([float(val) for val in data.values()]) % 100
        np.random.seed(int(seed))
        probability = np.clip(np.random.normal(0.35, 0.2), 0.05, 0.95)
        prediction = 1 if probability > THRESHOLD else 0
    else:
        # 轉換成DataFrame格式
        X = pd.DataFrame([data])

        # 獲取預測概率（取第二個類別的概率，即1類的概率）
        try:
            probability = _model.predict_proba(X)[0, 1]
        except:
            # 某些模型可能沒有predict_proba方法，則使用決策函數
            try:
                probability = _model.decision_function(X)[0]
                # 歸一化決策函數輸出為概率值
                probability = 1 / (1 + np.exp(-probability))
            except:
                # 如果都不支持，直接返回預測值
                prediction = _model.predict(X)[0]
                probability = float(prediction)
                return probability, prediction

        # 根據閾值確定預測結果
        prediction = 1 if probability > THRESHOLD else 0
    
    # 將結果保存到 Redis 緩存
    if redis_client:
        try:
            redis_client.setex(
                cache_key,
                REDIS_TTL,
                pickle.dumps((probability, prediction))
            )
            print(f"預測結果已保存到 Redis 緩存: {probability}, {prediction}")
        except Exception as e:
            print(f"保存預測結果到 Redis 失敗: {str(e)}")

    return probability, prediction


def get_feature_importance(data):
    """
    獲取特徵的重要性及其對當前預測的貢獻
    
    Args:
        data: 預處理後的特徵數據
    
    Returns:
        dict: 特徵名稱到特徵重要性的映射
    """
    _load_model()

    # 如果沒有特徵重要性，返回空字典
    if _feature_importances is None:
        return {}

    # 獲取特徵名稱
    feature_names = list(data.keys())

    # 標準化特徵值（用於計算貢獻度）
    values = np.array(list(data.values()))
    values_norm = (values - np.mean(values)) / np.std(values)

    # 特徵重要性乘以歸一化的特徵值，得到該特徵對當前預測的貢獻
    importances = {}

    # 確保特徵名稱和特徵重要性數量一致
    min_len = min(len(feature_names), len(_feature_importances))

    for i in range(min_len):
        # 計算特徵對當前預測的貢獻（特徵重要性 * 歸一化特徵值）
        contribution = float(_feature_importances[i] * values_norm[i])
        # 確保值是 JSON 可序列化的 Python 浮點數
        importances[feature_names[i]] = contribution

    # 確保所有值都是標準 Python 類型，而不是 numpy 類型
    result = {}
    for k, v in importances.items():
        # 將 numpy 數據類型轉換為 Python 浮點數
        if isinstance(v, (np.float32, np.float64)):
            result[k] = float(v)
        else:
            result[k] = v

    return result


def get_model_metrics():
    """
    獲取模型性能指標，優先從 Redis 緩存中獲取
    
    Returns:
        dict: 模型性能指標
    """
    # 嘗試從 Redis 緩存中獲取模型指標
    redis_client = get_redis_client()
    if redis_client:
        try:
            cached_metrics = redis_client.get('model:metrics')
            if cached_metrics:
                return json.loads(cached_metrics)
        except Exception as e:
            print(f"從 Redis 獲取模型指標失敗: {str(e)}")
    
    # 這裡應該從評估結果文件中讀取，這裡使用示例數據
    metrics = {
        'accuracy': 0.842,
        'precision': 0.723,
        'recall': 0.675,
        'f1_score': 0.698,
        'roc_auc': 0.856,
        'confusion_matrix': [
            [9830, 1170],
            [642, 1358]
        ]
    }
    
    # 將指標保存到 Redis 緩存
    if redis_client:
        try:
            redis_client.setex(
                'model:metrics',
                REDIS_TTL * 10,  # 模型指標緩存時間更長
                json.dumps(metrics)
            )
            print("模型指標已保存到 Redis 緩存")
        except Exception as e:
            print(f"保存模型指標到 Redis 失敗: {str(e)}")

    return metrics
