import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder
import logging
import math

logger = logging.getLogger(__name__)

# 緩存標籤編碼器，避免每次請求都重新創建
_label_encoders = {
    'gender': LabelEncoder().fit(['Male', 'Female']),
    'vehicle_age': LabelEncoder().fit(['< 1 Year', '1-2 Year', '> 2 Years']),
    'vehicle_damage': LabelEncoder().fit(['Yes', 'No'])
}

def preprocess_customer_data(customer_data):
    """
    預處理客戶數據，轉換為模型所需的格式
    
    Args:
        customer_data (dict): 原始客戶數據
        
    Returns:
        dict: 預處理後的特徵數據
    """
    try:
        # 創建特徵字典的副本
        processed_data = customer_data.copy()
        
        # 1. 標準化欄位名稱（轉換為大寫形式，與模型一致）
        processed_data = {k.lower(): v for k, v in processed_data.items()}
        
        # 2. 對分類特徵進行標籤編碼
        for feature, encoder in _label_encoders.items():
            if feature in processed_data:
                try:
                    processed_data[feature] = encoder.transform([processed_data[feature]])[0]
                except ValueError as e:
                    logger.error(f"標籤編碼錯誤 ({feature}): {e}")
                    # 如果編碼失敗，使用預設值
                    processed_data[feature] = 0
        
        # 3. 特徵工程：添加年齡組特徵
        if 'age' in processed_data:
            processed_data['age_group'] = _get_age_group(processed_data['age'])
        
        # 4. 特徵工程：添加年保費對數特徵
        if 'annual_premium' in processed_data:
            processed_data['annual_premium_log'] = math.log1p(processed_data['annual_premium'])
        
        # 5. 移除不需要的特徵（如果有的話）
        if 'id' in processed_data:
            del processed_data['id']
        
        # 6. 確保所有數值都是浮點數，避免數據類型問題
        for key, value in processed_data.items():
            if isinstance(value, (int, float)):
                processed_data[key] = float(value)
                
        return processed_data
    
    except Exception as e:
        logger.error(f"數據預處理錯誤: {e}")
        raise ValueError(f"數據預處理錯誤: {e}")

def _get_age_group(age):
    """
    將年齡轉換為年齡組
    
    Args:
        age (int): 年齡
        
    Returns:
        int: 年齡組編碼
    """
    if age < 25:
        return 0  # 青年
    elif age < 40:
        return 1  # 中年
    elif age < 60:
        return 2  # 中老年
    else:
        return 3  # 老年

def process_batch_data(batch_data):
    """
    批量處理多個客戶數據
    
    Args:
        batch_data (list): 客戶數據列表
        
    Returns:
        list: 預處理後的特徵數據列表
    """
    processed_batch = []
    errors = []
    
    for i, customer_data in enumerate(batch_data):
        try:
            processed_data = preprocess_customer_data(customer_data)
            processed_batch.append(processed_data)
        except Exception as e:
            logger.error(f"第 {i} 筆數據處理錯誤: {e}")
            errors.append((i, str(e)))
    
    return processed_batch, errors

def create_sample_data():
    """
    創建示例客戶數據，用於測試和開發
    
    Returns:
        dict: 示例客戶數據
    """
    return {
        'gender': 'Male',
        'age': 35,
        'driving_license': 1,
        'region_code': 28.0,
        'previously_insured': 0,
        'vehicle_age': '1-2 Year',
        'vehicle_damage': 'Yes',
        'annual_premium': 35000.0,
        'policy_sales_channel': 152.0,
        'vintage': 90
    }

def validate_prediction_input(data):
    """
    驗證預測輸入數據是否有效
    
    Args:
        data (dict): 輸入數據
        
    Returns:
        tuple: (是否有效, 錯誤信息)
    """
    # 檢查必要字段
    required_fields = [
        'Gender', 'Age', 'Driving_License', 'Region_Code',
        'Previously_Insured', 'Vehicle_Age', 'Vehicle_Damage',
        'Annual_Premium', 'Policy_Sales_Channel', 'Vintage'
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        return False, f"缺少必要字段: {', '.join(missing_fields)}"
    
    # 檢查數據類型
    try:
        # 數值型字段
        numeric_fields = ['Age', 'Annual_Premium', 'Vintage']
        for field in numeric_fields:
            if not isinstance(data[field], (int, float)) or data[field] < 0:
                return False, f"字段 {field} 必須為非負數值"
        
        # 布爾型字段（0或1）
        binary_fields = ['Driving_License', 'Previously_Insured']
        for field in binary_fields:
            if data[field] not in [0, 1]:
                return False, f"字段 {field} 必須為0或1"
        
        # 類別字段檢查
        if data['Gender'] not in ['Male', 'Female']:
            return False, "性別必須為 'Male' 或 'Female'"
        
        if data['Vehicle_Age'] not in ['< 1 Year', '1-2 Year', '> 2 Years']:
            return False, "車齡必須為 '< 1 Year', '1-2 Year' 或 '> 2 Years'"
        
        if data['Vehicle_Damage'] not in ['Yes', 'No']:
            return False, "車輛損壞必須為 'Yes' 或 'No'"
        
    except Exception as e:
        return False, f"數據驗證錯誤: {str(e)}"
    
    return True, None

def normalize_features(data):
    """
    標準化特徵，用於前端數據可視化
    
    Args:
        data (dict): 原始數據
        
    Returns:
        dict: 標準化後的數據
    """
    normalized = {}
    
    # 年齡標準化 (18-85 -> 0-1)
    normalized['Age'] = (data['Age'] - 18) / (85 - 18)
    
    # 保費標準化 (對數轉換後的值標準化)
    log_premium = np.log1p(data['Annual_Premium'])
    normalized['Annual_Premium'] = (log_premium - 8) / (12 - 8)  # 根據實際分布調整
    
    # 其他數值特徵...
    normalized['Vintage'] = data['Vintage'] / 300  # 假設最大值為300
    
    # 二元特徵直接使用
    normalized['Driving_License'] = data['Driving_License']
    normalized['Previously_Insured'] = data['Previously_Insured']
    
    # 類別特徵轉換
    normalized['Gender'] = 1 if data['Gender'] == 'Male' else 0
    
    normalized['Vehicle_Age'] = {
        '< 1 Year': 0,
        '1-2 Year': 0.5,
        '> 2 Years': 1
    }.get(data['Vehicle_Age'], 0)
    
    normalized['Vehicle_Damage'] = 1 if data['Vehicle_Damage'] == 'Yes' else 0
    
    return normalized

def calculate_feature_importance(data, result):
    """
    計算特徵重要性（用於解釋預測結果）
    
    這是一個簡化版本，實際應使用SHAP值或模型的feature_importances_
    
    Args:
        data (dict): 輸入數據
        result (dict): 預測結果
        
    Returns:
        dict: 特徵重要性
    """
    # 這只是一個示例，實際情況下應該基於模型輸出計算
    importances = {
        'Age': 0.15,
        'Previously_Insured': 0.25,
        'Vehicle_Damage': 0.20,
        'Annual_Premium': 0.10,
        'Vehicle_Age': 0.15,
        'Gender': 0.05,
        'Vintage': 0.05,
        'Region_Code': 0.03,
        'Policy_Sales_Channel': 0.02,
    }
    
    # 根據實際數據調整重要性
    if data['Previously_Insured'] == 1:
        importances['Previously_Insured'] = 0.35  # 如果已有車險，這個特徵更重要
        importances['Age'] = 0.10  # 相應減少其他特徵的重要性
    
    if data['Vehicle_Damage'] == 'Yes':
        importances['Vehicle_Damage'] = 0.25
        importances['Annual_Premium'] = 0.05
    
    return importances 