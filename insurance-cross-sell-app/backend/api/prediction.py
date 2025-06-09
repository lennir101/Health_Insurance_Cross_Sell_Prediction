from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.ml_service import predict_insurance_interest, get_user_predictions
from core.auth import jwt_required

prediction_bp = Blueprint('prediction', __name__)


@prediction_bp.route('', methods=['POST'])
@jwt_required
def predict():
    """
    進行保險交叉銷售預測
    """
    data = request.json
    user_id = request.user_id

    if not data:
        return jsonify({"error": "無效的輸入數據"}), 400

    try:
        # 進行預測
        result = predict_insurance_interest(data, user_id)

        return jsonify({
            "message": "預測成功",
            "result": result
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"預測失敗: {str(e)}"}), 500


@prediction_bp.route('', methods=['GET'])
@jwt_required
def history():
    """
    獲取用戶的預測歷史記錄
    """
    user_id = request.user_id
    limit = request.args.get('limit', 10, type=int)

    try:
        # 獲取預測歷史
        predictions = get_user_predictions(user_id, limit)

        return jsonify({
            "message": "獲取歷史記錄成功",
            "predictions": predictions,
            "count": len(predictions)
        }), 200
    except Exception as e:
        return jsonify({"error": f"獲取歷史記錄失敗: {str(e)}"}), 500


@prediction_bp.route('/sample', methods=['GET'])
def sample_data():
    """
    獲取樣本數據，用於前端展示
    """
    sample = {
        "Gender": "Male",
        "Age": 35,
        "Driving_License": 1,
        "Region_Code": 28,
        "Previously_Insured": 0,
        "Vehicle_Age": "1-2 Year",
        "Vehicle_Damage": "Yes",
        "Annual_Premium": 35000,
        "Policy_Sales_Channel": 152,
        "Vintage": 217
    }

    return jsonify({
        "message": "獲取樣本數據成功",
        "sample": sample
    }), 200


@prediction_bp.route('/bulk', methods=['POST'])
@jwt_required
def bulk_predict():
    """
    批量預測
    """
    data = request.json
    user_id = request.user_id

    if not data or not isinstance(data, list):
        return jsonify({"error": "無效的輸入數據，應為列表"}), 400

    try:
        results = []
        for item in data:
            result = predict_insurance_interest(item, user_id)
            results.append(result)

        return jsonify({
            "message": "批量預測成功",
            "results": results,
            "count": len(results)
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"批量預測失敗: {str(e)}"}), 500
