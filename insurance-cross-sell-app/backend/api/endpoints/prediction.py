from flask import Blueprint, request, jsonify
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib
import os
import time
from sklearn.preprocessing import LabelEncoder

# 導入配置
from config.settings import MODEL_PATH, THRESHOLD
from utils.data_processor import preprocess_customer_data
from services.prediction_service import make_prediction, get_feature_importance, get_model_metrics
from services.data_service import DataService

prediction_bp = Blueprint('prediction', __name__, url_prefix='/api')

# 初始化服務
data_service = DataService()


# 數據模型
class CustomerData(BaseModel):
    gender: str
    age: int
    driving_license: int
    region_code: float
    previously_insured: int
    vehicle_age: str
    vehicle_damage: str
    annual_premium: float
    policy_sales_channel: float
    vintage: int

    @validator('gender')
    def validate_gender(cls, v):
        if v not in ['Male', 'Female']:
            raise ValueError('性別必須為Male或Female')
        return v

    @validator('age')
    def validate_age(cls, v):
        if v < 18 or v > 100:
            raise ValueError('年齡必須在18-100之間')
        return v

    @validator('driving_license')
    def validate_driving_license(cls, v):
        if v not in [0, 1]:
            raise ValueError('駕照狀態必須為0或1')
        return v

    @validator('previously_insured')
    def validate_previously_insured(cls, v):
        if v not in [0, 1]:
            raise ValueError('已有保險狀態必須為0或1')
        return v

    @validator('vehicle_age')
    def validate_vehicle_age(cls, v):
        if v not in ['< 1 Year', '1-2 Year', '> 2 Years']:
            raise ValueError('車齡必須為< 1 Year、1-2 Year或> 2 Years')
        return v

    @validator('vehicle_damage')
    def validate_vehicle_damage(cls, v):
        if v not in ['Yes', 'No']:
            raise ValueError('車輛損壞必須為Yes或No')
        return v


class BatchPredictionRequest(BaseModel):
    customers: List[CustomerData]


# 路由
@prediction_bp.route('/predict', methods=['POST'])
def predict_single():
    """
    單一客戶預測
    ---
    tags:
      - prediction
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CustomerData'
    responses:
      200:
        description: 預測結果
      400:
        description: 輸入數據驗證錯誤
      500:
        description: 服務器錯誤
    """
    try:
        data = request.get_json()

        # 驗證輸入數據
        customer = CustomerData(**data)

        # 預處理數據
        processed_data = preprocess_customer_data(customer.dict())

        # 進行預測
        probability, prediction = make_prediction(processed_data)

        # 獲取特徵重要性
        features_importance = get_feature_importance(processed_data)
        
        # 獲取當前模型參數
        model_metrics = get_model_metrics()
        
        # 模型參數說明
        model_params_desc = {
            'learning_rate': '學習率 - 每次迭代對權重的調整幅度，較小的值可能需要更多迭代但有助於避免過擬合',
            'max_depth': '最大深度 - 樹的最大深度，增加深度可以提高模型複雜性',
            'n_estimators': '樹的數量 - 設置較大的值通常會提高性能，但也會增加計算開銷',
            'subsample': '子採樣率 - 每棵樹使用的訓練數據比例，小於1可以減少過擬合',
            'colsample_bytree': '特徵採樣率 - 每棵樹使用的特徵比例，小於1可以減少過擬合',
            'min_child_weight': '最小子權重 - 控制樹分裂的難度，較大的值可以減少過擬合',
            'scale_pos_weight': '正樣本權重比例 - 處理類別不平衡問題，增加少數類的權重',
            'threshold': '決策閾值 - 將概率轉換為二元預測的閾值，調整可以平衡精確率和召回率'
        }
        
        # 當前模型參數
        current_model_params = {
            'learning_rate': 0.1,
            'max_depth': 8,
            'n_estimators': 200,
            'subsample': 0.8,
            'colsample_bytree': 0.8,
            'min_child_weight': 2,
            'scale_pos_weight': 2,
            'threshold': float(THRESHOLD)
        }

        # 確保所有數值都是 JSON 可序列化的
        result = {
            'prediction': int(prediction),
            'probability': float(probability),
            'threshold': float(THRESHOLD),
            'features_importance': features_importance,
            'current_model_params': current_model_params,
            'model_params_desc': model_params_desc
        }
        
        return jsonify(result)

    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    except Exception as e:
        return jsonify({'error': f'預測失敗: {str(e)}'}), 500


@prediction_bp.route('/predict/batch', methods=['POST'])
def predict_batch():
    """
    批量客戶預測
    ---
    tags:
      - prediction
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/BatchPredictionRequest'
    responses:
      200:
        description: 批量預測結果
      400:
        description: 輸入數據驗證錯誤
      500:
        description: 服務器錯誤
    """
    try:
        data = request.get_json()

        # 驗證輸入數據
        batch_request = BatchPredictionRequest(**data)

        results = []
        success_count = 0

        for i, customer in enumerate(batch_request.customers):
            try:
                # 預處理數據
                processed_data = preprocess_customer_data(customer.dict())

                # 進行預測
                probability, prediction = make_prediction(processed_data)

                results.append({
                    'id': i,
                    'prediction': int(prediction),
                    'probability': float(probability)
                })

                success_count += 1

            except Exception as e:
                # 記錄錯誤但繼續處理其他數據
                results.append({
                    'id': i,
                    'error': str(e)
                })

        return jsonify({
            'predictions': results,
            'success_count': success_count,
            'total_count': len(batch_request.customers)
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 400

    except Exception as e:
        return jsonify({'error': f'批量預測失敗: {str(e)}'}), 500


@prediction_bp.route('/model/metrics', methods=['GET'])
def get_model_metrics():
    """
    獲取模型指標
    ---
    tags:
      - model
    responses:
      200:
        description: 模型性能指標
      500:
        description: 服務器錯誤
    """
    try:
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

        return jsonify(metrics)

    except Exception as e:
        return jsonify({'error': f'獲取模型指標失敗: {str(e)}'}), 500


@prediction_bp.route('/model/feature-importance', methods=['GET'])
def get_model_feature_importance():
    """
    獲取特徵重要性
    ---
    tags:
      - model
    responses:
      200:
        description: 特徵重要性
      500:
        description: 服務器錯誤
    """
    try:
        # 這裡應該從模型中讀取，這裡使用示例數據
        feature_importance = {
            'Age': 0.145,
            'Annual_Premium': 0.176,
            'Previously_Insured': 0.284,
            'Vehicle_Damage': 0.158,
            'Vehicle_Age': 0.092,
            'Vintage': 0.049,
            'Gender': 0.021,
            'Region_Code': 0.032,
            'Policy_Sales_Channel': 0.043
        }

        return jsonify(feature_importance)

    except Exception as e:
        return jsonify({'error': f'獲取特徵重要性失敗: {str(e)}'}), 500


@prediction_bp.route('/model/threshold-analysis', methods=['GET'])
def get_threshold_analysis():
    """
    獲取閾值分析
    ---
    tags:
      - model
    responses:
      200:
        description: 閾值分析
      500:
        description: 服務器錯誤
    """
    try:
        # 這裡應該從評估結果中讀取，這裡使用示例數據
        thresholds = []

        for threshold in np.arange(0.1, 1.0, 0.05):
            thresholds.append({
                'threshold': round(threshold, 2),
                'precision': round(0.5 + threshold * 0.5, 3),
                'recall': round(1.0 - threshold * 0.8, 3),
                'f1': round(0.65 + (threshold - 0.5) * 0.2, 3) if threshold <= 0.5 else round(
                    0.75 - (threshold - 0.5) * 0.4, 3)
            })

        return jsonify(thresholds)

    except Exception as e:
        return jsonify({'error': f'獲取閾值分析失敗: {str(e)}'}), 500


@prediction_bp.route('/statistics', methods=['GET'])
def get_statistics():
    """
    獲取數據統計信息
    ---
    tags:
      - data
    responses:
      200:
        description: 數據統計信息
      500:
        description: 服務器錯誤
    """
    try:
        # 這裡應該從數據中計算，這裡使用示例數據
        statistics = {
            'feature_distributions': {
                'age': {
                    '18-25': 1250,
                    '26-35': 3540,
                    '36-45': 4320,
                    '46-55': 2780,
                    '56-65': 1450,
                    '65+': 660
                }
            },
            'correlation_matrix': {
                'Age': {
                    'Age': 1.0,
                    'Annual_Premium': 0.26,
                    'Previously_Insured': 0.14,
                    'Response': 0.18
                },
                'Annual_Premium': {
                    'Age': 0.26,
                    'Annual_Premium': 1.0,
                    'Previously_Insured': 0.06,
                    'Response': 0.12
                }
            },
            'age_group_stats': [
                {'group': '青年', 'count': 4790, 'avg_premium': 23500, 'response_rate': 0.28},
                {'group': '中年', 'count': 7100, 'avg_premium': 28700, 'response_rate': 0.22},
                {'group': '中老年', 'count': 4230, 'avg_premium': 32100, 'response_rate': 0.15},
                {'group': '老年', 'count': 880, 'avg_premium': 35600, 'response_rate': 0.09}
            ],
            'vehicle_stats': {
                'age_distribution': {
                    '< 1 Year': 3820,
                    '1-2 Year': 7340,
                    '> 2 Years': 5840
                },
                'damage_distribution': {
                    'Yes': 9280,
                    'No': 7720
                }
            }
        }

        return jsonify(statistics)

    except Exception as e:
        return jsonify({'error': f'獲取統計信息失敗: {str(e)}'}), 500


@prediction_bp.route('/data/correlation', methods=['GET'])
def get_correlation_matrix():
    """
    獲取數值特徵之間的相關性矩陣
    ---
    tags:
      - data
    responses:
      200:
        description: 相關性矩陣數據
      500:
        description: 服務器錯誤
    """
    try:
        # 獲取相關性矩陣
        correlation_matrix = data_service.get_correlation_matrix()

        return jsonify(correlation_matrix)

    except Exception as e:
        return jsonify({'error': f'獲取相關性矩陣失敗: {str(e)}'}), 500
