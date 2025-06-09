from datetime import datetime
import json
from core.database import db


class Prediction(db.Model):
    """
    預測記錄模型
    """
    __tablename__ = 'predictions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    input_data = db.Column(db.Text, nullable=False)  # JSON格式的輸入數據
    probability = db.Column(db.Float, nullable=False)  # 預測概率
    prediction = db.Column(db.Boolean, nullable=False)  # 預測結果（是否感興趣）
    threshold = db.Column(db.Float, nullable=False)  # 使用的閾值
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<Prediction {self.id}>'

    @property
    def input_dict(self):
        """將JSON字符串轉換為字典"""
        return json.loads(self.input_data)

    @staticmethod
    def create_from_prediction(user_id, input_data, probability, threshold):
        """
        從預測結果創建記錄
        """
        prediction = Prediction(
            user_id=user_id,
            input_data=json.dumps(input_data),
            probability=probability,
            prediction=probability > threshold,
            threshold=threshold
        )
        db.session.add(prediction)
        db.session.commit()
        return prediction

    def to_dict(self):
        """轉換為字典"""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'input_data': self.input_dict,
            'probability': self.probability,
            'prediction': self.prediction,
            'threshold': self.threshold,
            'created_at': self.created_at.isoformat()
        }
