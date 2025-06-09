import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional, Union
import logging
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)
import xgboost as xgb
from .data_service import DataService

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class ModelService:
    """
    模型服務類，負責模型訓練、評估和預測
    
    主要功能：
    1. 加載和訓練模型
    2. 模型預測（單一和批量）
    3. 模型評估和指標計算
    4. 模型保存和加載
    """

    # 可選模型類型
    MODEL_TYPES = {
        'xgboost': 'XGBoost分類器',
        'random_forest': '隨機森林分類器',
        'gradient_boosting': '梯度提升樹分類器'
    }

    # 默認特徵集
    DEFAULT_FEATURES = [
        'gender', 'age', 'driving_license', 'region_code',
        'previously_insured', 'vehicle_age', 'vehicle_damage',
        'annual_premium', 'policy_sales_channel', 'vintage',
        'annual_premium_log'  # 自定義特徵
    ]

    def __init__(self, model_dir: str = None, model_type: str = 'xgboost'):
        """
        初始化模型服務
        
        Args:
            model_dir: 模型目錄路徑
            model_type: 模型類型，可選值為 'xgboost', 'random_forest', 'gradient_boosting'
        """
        # 獲取基礎目錄
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        # 設置模型目錄
        self.model_dir = model_dir or os.path.join(base_dir, 'ml_models')
        os.makedirs(self.model_dir, exist_ok=True)
        logger.info(f"模型目錄設置為: {self.model_dir}")

        # 設置模型類型
        if model_type not in self.MODEL_TYPES:
            raise ValueError(f"不支持的模型類型: {model_type}，可選值為: {list(self.MODEL_TYPES.keys())}")
        self.model_type = model_type

        # 初始化數據服務
        self.data_service = DataService()

        # 初始化模型
        self.model = None
        self.feature_names = self.DEFAULT_FEATURES
        self.threshold = 0.5  # 默認決策閾值

        # 嘗試加載現有模型
        self._try_load_model()

    def _try_load_model(self) -> bool:
        """
        嘗試加載現有模型
        
        Returns:
            是否成功加載
        """
        model_path = os.path.join(self.model_dir, f"{self.model_type}_model.pkl")

        if os.path.exists(model_path):
            try:
                # 加載模型
                self.model = joblib.load(model_path)

                # 加載模型配置
                config_path = os.path.join(self.model_dir, f"{self.model_type}_config.pkl")
                if os.path.exists(config_path):
                    config = joblib.load(config_path)
                    self.feature_names = config.get('feature_names', self.DEFAULT_FEATURES)
                    self.threshold = config.get('threshold', 0.5)

                logger.info(f"成功加載現有模型: {model_path}")
                return True
            except Exception as e:
                logger.error(f"加載模型失敗: {str(e)}")

        logger.info("未找到現有模型或加載失敗")
        return False

    def _create_model(self) -> Any:
        """
        創建模型實例
        
        Returns:
            模型實例
        """
        if self.model_type == 'xgboost':
            # 參考 step_5_全数据模型训练.py 中的優化參數
            return xgb.XGBClassifier(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                min_child_weight=2,
                gamma=0.2,
                reg_alpha=0.1,
                reg_lambda=1,
                scale_pos_weight=2,
                objective='binary:logistic',
                eval_metric='auc',
                use_label_encoder=False,
                random_state=42
            )
        elif self.model_type == 'random_forest':
            return RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=10,
                min_samples_leaf=4,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1
            )
        elif self.model_type == 'gradient_boosting':
            return GradientBoostingClassifier(
                n_estimators=200,
                max_depth=8,
                learning_rate=0.1,
                subsample=0.8,
                min_samples_split=10,
                min_samples_leaf=4,
                max_features='sqrt',
                random_state=42
            )
        else:
            raise ValueError(f"不支持的模型類型: {self.model_type}")

    def _prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        準備模型特徵
        
        Args:
            df: 數據框
            
        Returns:
            處理後的特徵數據框
        """
        # 確保所有列名小寫
        df.columns = [col.lower() for col in df.columns]

        # 處理類別特徵
        if 'gender' in df.columns and df['gender'].dtype == 'object':
            df['gender'] = df['gender'].map({'Male': 1, 'Female': 0})

        if 'vehicle_age' in df.columns and df['vehicle_age'].dtype == 'object':
            vehicle_age_map = {
                '< 1 Year': 0,
                '1-2 Year': 1,
                '> 2 Years': 2
            }
            df['vehicle_age'] = df['vehicle_age'].map(vehicle_age_map)

        if 'vehicle_damage' in df.columns and df['vehicle_damage'].dtype == 'object':
            df['vehicle_damage'] = df['vehicle_damage'].map({'Yes': 1, 'No': 0})

        # 確保所有特徵都存在
        for feature in self.feature_names:
            if feature not in df.columns:
                # 對於缺失特徵，添加全為0的列
                df[feature] = 0
                logger.warning(f"特徵 {feature} 在數據中不存在，已添加全為0的列")

        # 提取需要的特徵
        X = df[self.feature_names].copy()

        return X

    def train(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        訓練模型
        
        Args:
            params: 模型參數，可選
            
        Returns:
            訓練結果，包含模型評估指標
        """
        # 獲取數據
        train_df, val_df = self.data_service.split_train_validation(test_size=0.2)

        # 準備特徵和標籤
        X_train = self._prepare_features(train_df)
        y_train = train_df['response']

        X_val = self._prepare_features(val_df)
        y_val = val_df['response']

        # 創建模型
        self.model = self._create_model()

        # 更新模型參數（如果提供）
        if params:
            self.model.set_params(**params)

        # 訓練模型
        logger.info(f"開始訓練 {self.MODEL_TYPES[self.model_type]} 模型...")
        self.model.fit(X_train, y_train)

        # 評估模型
        val_metrics = self.evaluate(X_val, y_val)

        # 保存模型
        self.save_model()

        logger.info(f"模型訓練完成，驗證集 AUC: {val_metrics['auc_roc']:.4f}")

        return {
            "model_type": self.model_type,
            "validation_metrics": val_metrics,
            "feature_importance": self.get_feature_importance()
        }

    def predict(self, data: Union[Dict[str, Any], pd.DataFrame], threshold: float = None) -> Dict[str, Any]:
        """
        單一預測
        
        Args:
            data: 客戶數據，字典或數據框
            threshold: 決策閾值，如果為None則使用默認閾值
            
        Returns:
            預測結果
        """
        if self.model is None:
            raise ValueError("模型未訓練或加載失敗")

        # 設置閾值
        threshold = threshold or self.threshold

        # 將字典轉換為數據框
        if isinstance(data, dict):
            data_df = pd.DataFrame([data])
        else:
            data_df = data.copy()

        # 準備特徵
        X = self._prepare_features(data_df)

        # 獲取預測概率
        if hasattr(self.model, 'predict_proba'):
            probas = self.model.predict_proba(X)[:, 1]
        else:
            probas = self.model.predict(X)

        # 根據閾值進行分類
        predictions = (probas >= threshold).astype(int)

        # 返回結果
        results = []
        for i in range(len(data_df)):
            result = {
                "probability": float(probas[i]),
                "prediction": int(predictions[i]),
                "threshold": float(threshold)
            }

            # 如果原始數據是字典，添加原始數據
            if isinstance(data, dict):
                result["customer_data"] = data

            results.append(result)

        # 如果只有一個結果，返回單個結果
        if len(results) == 1:
            return results[0]

        return {"results": results}

    def batch_predict(self, data: pd.DataFrame, threshold: float = None) -> List[Dict[str, Any]]:
        """
        批量預測
        
        Args:
            data: 批量客戶數據
            threshold: 決策閾值，如果為None則使用默認閾值
            
        Returns:
            預測結果列表
        """
        if self.model is None:
            raise ValueError("模型未訓練或加載失敗")

        # 調用單一預測
        result = self.predict(data, threshold)

        # 返回結果列表
        return result["results"]

    def evaluate(self, X: pd.DataFrame = None, y: pd.Series = None) -> Dict[str, float]:
        """
        評估模型
        
        Args:
            X: 特徵數據，如果為None則使用驗證集
            y: 標籤數據，如果為None則使用驗證集
            
        Returns:
            評估指標
        """
        if self.model is None:
            raise ValueError("模型未訓練或加載失敗")

        # 如果未提供數據，使用驗證集
        if X is None or y is None:
            _, val_df = self.data_service.split_train_validation(test_size=0.2)
            X = self._prepare_features(val_df)
            y = val_df['response']

        # 獲取預測概率
        if hasattr(self.model, 'predict_proba'):
            y_proba = self.model.predict_proba(X)[:, 1]
        else:
            y_proba = self.model.predict(X)

        # 根據閾值進行分類
        y_pred = (y_proba >= self.threshold).astype(int)

        # 計算評估指標
        metrics = {
            "accuracy": float(accuracy_score(y, y_pred)),
            "precision": float(precision_score(y, y_pred)),
            "recall": float(recall_score(y, y_pred)),
            "f1_score": float(f1_score(y, y_pred)),
            "auc_roc": float(roc_auc_score(y, y_proba)),
            "confusion_matrix": confusion_matrix(y, y_pred).tolist(),
            "threshold": float(self.threshold)
        }

        return metrics

    def save_model(self) -> str:
        """
        保存模型
        
        Returns:
            模型保存路徑
        """
        if self.model is None:
            raise ValueError("模型未訓練，無法保存")

        # 保存模型
        model_path = os.path.join(self.model_dir, f"{self.model_type}_model.pkl")
        joblib.dump(self.model, model_path)

        # 保存模型配置
        config_path = os.path.join(self.model_dir, f"{self.model_type}_config.pkl")
        config = {
            'feature_names': self.feature_names,
            'threshold': self.threshold,
            'model_type': self.model_type
        }
        joblib.dump(config, config_path)

        logger.info(f"模型已保存到: {model_path}")
        return model_path

    def get_feature_importance(self) -> Dict[str, float]:
        """
        獲取特徵重要性
        
        Returns:
            特徵重要性字典
        """
        if self.model is None:
            raise ValueError("模型未訓練或加載失敗")

        # 獲取特徵重要性
        if hasattr(self.model, 'feature_importances_'):
            importances = self.model.feature_importances_
        elif self.model_type == 'xgboost':
            # XGBoost可能以不同方式存儲特徵重要性
            importance_type = 'weight'
            importances = self.model.get_booster().get_score(importance_type=importance_type)
            # 將特徵名稱與特徵索引匹配
            feature_importance = {}
            for feature, importance in importances.items():
                feature_idx = int(feature.replace('f', ''))
                if feature_idx < len(self.feature_names):
                    feature_importance[self.feature_names[feature_idx]] = float(importance)
            return feature_importance
        else:
            raise ValueError(f"模型類型 {self.model_type} 不支持獲取特徵重要性")

        # 創建特徵重要性字典
        feature_importance = {}
        for i, feature in enumerate(self.feature_names):
            if i < len(importances):
                feature_importance[feature] = float(importances[i])

        return feature_importance

    def find_optimal_threshold(self, metric: str = 'f1') -> float:
        """
        尋找最佳閾值
        
        參考 step_2_1_手动粗调_寻找最佳阈值.py
        
        Args:
            metric: 優化指標，可選值為 'f1', 'accuracy', 'precision', 'recall'
            
        Returns:
            最佳閾值
        """
        if self.model is None:
            raise ValueError("模型未訓練或加載失敗")

        # 獲取驗證集
        _, val_df = self.data_service.split_train_validation(test_size=0.2)
        X_val = self._prepare_features(val_df)
        y_val = val_df['response']

        # 獲取預測概率
        if hasattr(self.model, 'predict_proba'):
            y_proba = self.model.predict_proba(X_val)[:, 1]
        else:
            y_proba = self.model.predict(X_val)

        # 測試不同閾值
        thresholds = np.arange(0.05, 0.95, 0.05)
        best_score = -1
        best_threshold = 0.5

        for threshold in thresholds:
            y_pred = (y_proba >= threshold).astype(int)

            if metric == 'f1':
                score = f1_score(y_val, y_pred)
            elif metric == 'accuracy':
                score = accuracy_score(y_val, y_pred)
            elif metric == 'precision':
                score = precision_score(y_val, y_pred)
            elif metric == 'recall':
                score = recall_score(y_val, y_pred)
            else:
                raise ValueError(f"不支持的優化指標: {metric}")

            if score > best_score:
                best_score = score
                best_threshold = threshold

        # 更新閾值
        self.threshold = best_threshold

        # 保存更新後的配置
        config_path = os.path.join(self.model_dir, f"{self.model_type}_config.pkl")
        config = {
            'feature_names': self.feature_names,
            'threshold': self.threshold,
            'model_type': self.model_type
        }
        joblib.dump(config, config_path)

        logger.info(f"已找到最佳閾值: {self.threshold:.2f}，{metric}指標: {best_score:.4f}")

        return self.threshold
