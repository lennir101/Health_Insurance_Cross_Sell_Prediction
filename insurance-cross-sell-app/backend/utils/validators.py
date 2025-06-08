import re
from marshmallow import Schema, fields, validate, ValidationError

class UserSchema(Schema):
    """
    用戶數據驗證模式
    """
    username = fields.String(required=True, validate=validate.Length(min=3, max=50))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))
    is_admin = fields.Boolean(default=False)

class LoginSchema(Schema):
    """
    登錄數據驗證模式
    """
    username = fields.String(required=True)
    password = fields.String(required=True)

class PredictionInputSchema(Schema):
    """
    預測輸入數據驗證模式
    """
    Gender = fields.String(required=True, validate=validate.OneOf(['Male', 'Female']))
    Age = fields.Integer(required=True, validate=validate.Range(min=18, max=100))
    Driving_License = fields.Integer(required=True, validate=validate.OneOf([0, 1]))
    Region_Code = fields.Integer(required=True)
    Previously_Insured = fields.Integer(required=True, validate=validate.OneOf([0, 1]))
    Vehicle_Age = fields.String(required=True, validate=validate.OneOf(['< 1 Year', '1-2 Year', '> 2 Years']))
    Vehicle_Damage = fields.String(required=True, validate=validate.OneOf(['Yes', 'No']))
    Annual_Premium = fields.Float(required=True, validate=validate.Range(min=0))
    Policy_Sales_Channel = fields.Integer(required=True)
    Vintage = fields.Integer(required=True, validate=validate.Range(min=0))

def validate_email(email):
    """
    驗證電子郵件格式
    
    Args:
        email (str): 電子郵件
        
    Returns:
        bool: 是否有效
    """
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email))

def validate_password_strength(password):
    """
    驗證密碼強度
    
    Args:
        password (str): 密碼
        
    Returns:
        tuple: (是否有效, 錯誤信息)
    """
    if len(password) < 6:
        return False, "密碼長度必須至少為6個字符"
    
    # 檢查是否包含至少一個數字
    if not any(char.isdigit() for char in password):
        return False, "密碼必須包含至少一個數字"
    
    # 檢查是否包含至少一個字母
    if not any(char.isalpha() for char in password):
        return False, "密碼必須包含至少一個字母"
    
    return True, None

def validate_json_input(data, schema_class):
    """
    使用Marshmallow驗證JSON輸入數據
    
    Args:
        data (dict): 輸入數據
        schema_class (Schema): Marshmallow模式類
        
    Returns:
        tuple: (驗證後的數據, 錯誤信息)
    """
    schema = schema_class()
    
    try:
        validated_data = schema.load(data)
        return validated_data, None
    except ValidationError as e:
        return None, e.messages 