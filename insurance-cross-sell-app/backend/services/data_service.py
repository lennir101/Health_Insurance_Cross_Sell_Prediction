import os
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
import logging

# 設置日誌
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class DataService:
    """
    數據服務類，負責數據的讀取、預處理和統計分析
    
    主要功能：
    1. 讀取原始CSV數據
    2. 執行數據預處理
    3. 生成數據統計
    4. 劃分訓練集和測試集
    """
    
    def __init__(self, data_dir: str = None):
        """
        初始化數據服務
        
        Args:
            data_dir: 數據目錄路徑，默認使用相對路徑
        """
        # 獲取基礎目錄
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        # 設置數據目錄
        self.data_dir = data_dir or os.path.join(base_dir, 'archive_data')
        logger.info(f"數據目錄設置為: {self.data_dir}")
        
        # 數據文件路徑
        self.train_path = os.path.join(self.data_dir, 'train.csv')
        self.test_path = os.path.join(self.data_dir, 'test.csv')
        
        # 驗證數據文件是否存在
        self._validate_data_files()
        
        # 緩存處理後的數據
        self._train_df = None
        self._test_df = None

    def _validate_data_files(self) -> None:
        """驗證數據文件是否存在"""
        if not os.path.exists(self.train_path):
            raise FileNotFoundError(f"訓練數據文件不存在: {self.train_path}")
        
        if not os.path.exists(self.test_path):
            raise FileNotFoundError(f"測試數據文件不存在: {self.test_path}")
        
        logger.info("數據文件驗證成功")

    def get_raw_train_data(self) -> pd.DataFrame:
        """獲取原始訓練數據"""
        return pd.read_csv(self.train_path)
    
    def get_raw_test_data(self) -> pd.DataFrame:
        """獲取原始測試數據"""
        return pd.read_csv(self.test_path)
    
    def _preprocess_data(self, df: pd.DataFrame, is_train: bool = True) -> pd.DataFrame:
        """
        預處理數據
        
        參考原始代碼 step_1_2_训练集数据预处理.py 和 step_1_3_测试用数据预处理.py
        
        Args:
            df: 原始數據
            is_train: 是否為訓練數據
            
        Returns:
            處理後的數據
        """
        # 創建數據的副本，避免修改原始數據
        processed_df = df.copy()
        
        # 1. 添加 Annual_Premium_Log 特徵（對數轉換保費）
        processed_df["annual_premium_log"] = np.log1p(processed_df["Annual_Premium"])
        
        # 2. 添加 Age_Group 特徵（年齡段分類）
        def age_group(age):
            if age < 25:
                return "青年"
            elif age < 40:
                return "中年"
            elif age < 60:
                return "中老年"
            else:
                return "老年"
        
        processed_df["age_group"] = processed_df["Age"].apply(age_group)
        
        # 3. 特徵名稱標準化（全部小寫並使用下劃線分隔）
        processed_df.columns = [col.lower().replace(' ', '_') for col in processed_df.columns]
        
        logger.info(f"數據預處理完成，{'訓練' if is_train else '測試'}數據共 {len(processed_df)} 行")
        return processed_df
    
    def get_processed_train_data(self) -> pd.DataFrame:
        """獲取處理後的訓練數據（帶緩存）"""
        if self._train_df is None:
            raw_df = self.get_raw_train_data()
            self._train_df = self._preprocess_data(raw_df, is_train=True)
        return self._train_df
    
    def get_processed_test_data(self) -> pd.DataFrame:
        """獲取處理後的測試數據（帶緩存）"""
        if self._test_df is None:
            raw_df = self.get_raw_test_data()
            self._test_df = self._preprocess_data(raw_df, is_train=False)
        return self._test_df
    
    def get_data_stats(self) -> Dict[str, Any]:
        """
        獲取數據統計信息
        
        Returns:
            包含數據統計的字典
        """
        train_df = self.get_processed_train_data()
        
        # 基本統計信息
        stats = {
            "total_records": len(train_df),
            "features_stats": {},
        }
        
        # 數值型特徵統計
        numeric_features = train_df.select_dtypes(include=['int64', 'float64']).columns
        for feature in numeric_features:
            stats["features_stats"][feature] = {
                "min": float(train_df[feature].min()),
                "max": float(train_df[feature].max()),
                "mean": float(train_df[feature].mean()),
                "median": float(train_df[feature].median()),
                "std": float(train_df[feature].std()),
                "type": "numeric"
            }
        
        # 類別型特徵統計
        categorical_features = train_df.select_dtypes(include=['object']).columns
        for feature in categorical_features:
            value_counts = train_df[feature].value_counts().to_dict()
            stats["features_stats"][feature] = {
                "unique_values": len(value_counts),
                "distribution": {str(k): int(v) for k, v in value_counts.items()},
                "type": "categorical"
            }
        
        # 目標變量分佈（如果存在）
        if 'response' in train_df.columns:
            stats["target_distribution"] = train_df['response'].value_counts().to_dict()
        
        logger.info("數據統計生成完成")
        return stats
    
    def split_train_validation(self, test_size: float = 0.2, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        劃分訓練集和驗證集
        
        Args:
            test_size: 驗證集佔比
            random_state: 隨機種子
            
        Returns:
            (訓練集, 驗證集)
        """
        from sklearn.model_selection import train_test_split
        
        train_df = self.get_processed_train_data()
        train_data, val_data = train_test_split(
            train_df, 
            test_size=test_size, 
            random_state=random_state,
            stratify=train_df['response'] if 'response' in train_df.columns else None
        )
        
        logger.info(f"數據已劃分為訓練集 ({len(train_data)} 行) 和驗證集 ({len(val_data)} 行)")
        return train_data, val_data
    
    def save_processed_data(self, output_dir: str = None) -> Dict[str, str]:
        """
        保存處理後的數據到文件
        
        Args:
            output_dir: 輸出目錄，默認為data_dir/processed
            
        Returns:
            保存的文件路徑字典
        """
        if output_dir is None:
            output_dir = os.path.join(self.data_dir, 'processed')
        
        os.makedirs(output_dir, exist_ok=True)
        
        # 保存處理後的訓練數據
        train_output_path = os.path.join(output_dir, 'train_processed.csv')
        self.get_processed_train_data().to_csv(train_output_path, index=False)
        
        # 保存處理後的測試數據
        test_output_path = os.path.join(output_dir, 'test_processed.csv')
        self.get_processed_test_data().to_csv(test_output_path, index=False)
        
        logger.info(f"處理後的數據已保存到 {output_dir}")
        
        return {
            "train_processed": train_output_path,
            "test_processed": test_output_path
        } 