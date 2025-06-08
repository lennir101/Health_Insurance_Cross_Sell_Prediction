#!/bin/bash

# 設置腳本目錄為工作目錄
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# 顯示歡迎信息
echo "======================================"
echo "健康保險交叉銷售預測系統 - 環境設置腳本"
echo "======================================"
echo

# 創建Python虛擬環境
echo "創建Python虛擬環境..."
python3 -m venv backend/venv
source backend/venv/bin/activate

# 安裝後端依賴
echo "安裝後端依賴..."
pip install -r backend/requirements.txt

# 創建必要的目錄
echo "創建必要的目錄..."
mkdir -p backend/ml_models

# 設置模型文件
echo "請將模型文件(final_model.joblib)和標籤編碼器(label_encoders.joblib)放入 backend/ml_models/ 目錄"
echo "模型文件路徑: $(pwd)/backend/ml_models/"

# 初始化數據庫
echo "初始化數據庫..."
cd backend
export FLASK_APP=wsgi.py
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
cd ..

echo
echo "後端環境設置完成！"
echo
echo "要啟動後端服務器，請運行:"
echo "cd backend && source venv/bin/activate && flask run --debug"
echo

# 詢問是否設置前端
read -p "是否設置前端環境？(y/n): " setup_frontend
if [[ $setup_frontend == "y" || $setup_frontend == "Y" ]]; then
    # 檢查是否安裝了Node.js
    if ! command -v node &> /dev/null; then
        echo "未找到Node.js。請先安裝Node.js，然後再設置前端環境。"
        exit 1
    fi
    
    echo "設置前端環境..."
    cd frontend
    npm install
    
    echo
    echo "前端環境設置完成！"
    echo
    echo "要啟動前端開發服務器，請運行:"
    echo "cd frontend && npm run dev"
fi

echo
echo "環境設置完成！" 