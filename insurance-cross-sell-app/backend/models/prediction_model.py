import os
import joblib
import numpy as np
import pandas as pd
from flask import current_app

class InsurancePredictionModel:
    """
    保險預測模型類
    """
    def __init__(self):
        self.model = None
        self.label_encoders = None
        self.threshold = None
        self.is_loaded = False
    
    def load(self):
        """
        加載模型和標籤編碼器
        """
        if self.is_loaded:
            return
        
        try:
            # 從配置中獲取路徑
            model_path = current_app.config['MODEL_PATH']
            encoders_path = current_app.config['LABEL_ENCODERS_PATH']
            self.threshold = current_app.config['PREDICTION_THRESHOLD']
            
            # 檢查文件是否存在
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"模型文件不存在: {model_path}")
            
            if not os.path.exists(encoders_path):
                raise FileNotFoundError(f"編碼器文件不存在: {encoders_path}")
            
            # 加載模型和編碼器
            self.model = joblib.load(model_path)
            self.label_encoders = joblib.load(encoders_path)
            self.is_loaded = True
            
            print(f"✅ 模型加載成功: {model_path}")
            print(f"✅ 編碼器加載成功: {encoders_path}")
            
        except Exception as e:
            print(f"❌ 模型加載失敗: {str(e)}")
            raise
    
    def preprocess(self, data):
        """
        預處理輸入數據
        """
        # 確保模型已加載
        if not self.is_loaded:
            self.load()
        
        # 轉換為DataFrame
        df = pd.DataFrame([data])
        
        # 特徵工程：年齡分組
        def age_group(age):
            if age < 25:
                return "青年"
            elif age < 40:
                return "中年"
            elif age < 60:
                return "中老年"
            else:
                return "老年"
        
        # 添加特徵
        df["Age_Group"] = df["Age"].apply(age_group)
        df["Annual_Premium_Log"] = np.log1p(df["Annual_Premium"])
        
        # 編碼類別特徵
        for col in df.select_dtypes(include=["object"]):
            if col in self.label_encoders:
                df[col] = self.label_encoders[col].transform(df[col].astype(str))
        
        return df
    
    def predict(self, data):
        """
        預測輸入數據的結果
        """
        # 確保模型已加載
        if not self.is_loaded:
            self.load()
        
        # 預處理數據
        processed_data = self.preprocess(data)
        
        # 預測概率
        probability = self.model.predict_proba(processed_data)[0, 1]
        
        # 根據閾值判斷結果
        prediction = bool(probability > self.threshold)
        
        return {
            "probability": float(probability),
            "prediction": prediction,
            "threshold": self.threshold,
            "interest_level": self.interpret_probability(probability)
        }
    
    def interpret_probability(self, probability):
        """
        解釋預測概率
        """
        if probability < 0.2:
            return "極低"
        elif probability < 0.3:
            return "低"
        elif probability < 0.5:
            return "中等"
        elif probability < 0.7:
            return "高"
        else:
            return "極高"

# 創建單例實例
prediction_model = InsurancePredictionModel() 