from flask import current_app
from models.prediction_model import prediction_model
from models.prediction import Prediction

def predict_insurance_interest(data, user_id=None):
    """
    預測客戶對車險的興趣度
    
    Args:
        data (dict): 客戶數據
        user_id (int, optional): 用戶ID，用於記錄預測歷史
        
    Returns:
        dict: 預測結果
    """
    # 數據驗證
    required_fields = [
        'Gender', 'Age', 'Driving_License', 'Region_Code',
        'Previously_Insured', 'Vehicle_Age', 'Vehicle_Damage',
        'Annual_Premium', 'Policy_Sales_Channel', 'Vintage'
    ]
    
    missing_fields = [field for field in required_fields if field not in data]
    if missing_fields:
        raise ValueError(f"缺少必要字段: {', '.join(missing_fields)}")
    
    # 進行預測
    result = prediction_model.predict(data)
    
    # 如果有用戶ID，則記錄預測結果
    if user_id:
        Prediction.create_from_prediction(
            user_id=user_id,
            input_data=data,
            probability=result['probability'],
            threshold=result['threshold']
        )
    
    # 添加詳細的解釋
    result['explanation'] = generate_explanation(data, result)
    
    return result

def generate_explanation(data, result):
    """
    生成預測結果的詳細解釋
    
    Args:
        data (dict): 客戶數據
        result (dict): 預測結果
        
    Returns:
        str: 解釋文本
    """
    prediction = result['prediction']
    probability = result['probability']
    interest_level = result['interest_level']
    
    # 基本解釋
    if prediction:
        explanation = f"客戶很可能對車險產品感興趣 (興趣度: {interest_level}, 概率: {probability:.2%})。"
    else:
        explanation = f"客戶可能對車險產品不感興趣 (興趣度: {interest_level}, 概率: {probability:.2%})。"
    
    # 根據關鍵特徵添加詳細解釋
    details = []
    
    # 年齡因素
    if data['Age'] < 30:
        details.append("年輕客戶通常對新保險產品更開放。")
    elif data['Age'] > 60:
        details.append("年長客戶可能已有現有保險或需求較低。")
    
    # 車輛因素
    if data['Vehicle_Age'] == 'more than 2 years':
        details.append("車齡較長，可能增加購買車險的需求。")
    
    if data['Vehicle_Damage'] == 'Yes':
        details.append("有車輛損壞記錄，表明客戶意識到車險的重要性。")
    
    # 保險歷史
    if data['Previously_Insured'] == 1:
        details.append("客戶已有車險，可能降低購買新車險的可能性。")
    else:
        details.append("客戶尚未投保車險，存在潛在需求。")
    
    # 保費因素
    if data['Annual_Premium'] > 50000:
        details.append("目前健康保險保費較高，表明客戶有較高的保險消費能力。")
    
    # 合併解釋
    if details:
        explanation += "\n\n主要考慮因素:\n- " + "\n- ".join(details)
    
    return explanation

def get_user_predictions(user_id, limit=10):
    """
    獲取用戶的預測歷史記錄
    
    Args:
        user_id (int): 用戶ID
        limit (int, optional): 最大記錄數量
        
    Returns:
        list: 預測歷史記錄列表
    """
    predictions = Prediction.query.filter_by(user_id=user_id).order_by(
        Prediction.created_at.desc()
    ).limit(limit).all()
    
    return [prediction.to_dict() for prediction in predictions] 