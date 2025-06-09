#!/bin/bash

# 保險交叉銷售預測系統啟動腳本
# 
# 此腳本用於啟動前後端服務
# 如需修改端口，請編輯以下配置文件：
# - 前端：frontend/src/config/appConfig.ts
# - 後端：backend/config/server_config.py

# 顯示標題
echo "========================================"
echo "保險交叉銷售預測系統啟動腳本"
echo "========================================"

# 獲取腳本所在目錄
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# 提示用戶選擇啟動模式
echo "請選擇啟動模式："
echo "1) 啟動後端服務"
echo "2) 啟動前端開發服務器"
echo "3) 同時啟動前後端服務"
echo "4) 退出"
read -p "請輸入選項 (1-4): " choice

case $choice in
    1)
        # 啟動後端服務
        echo "啟動後端服務..."
        echo "注意：如需修改端口，請編輯 backend/config/server_config.py"
        cd "$SCRIPT_DIR"
        python backend/app.py
        ;;
    2)
        # 啟動前端開發服務器
        echo "啟動前端開發服務器..."
        echo "注意：如需修改後端連接設置，請編輯 frontend/src/config/appConfig.ts"
        cd "$SCRIPT_DIR/frontend"
        npm run dev
        ;;
    3)
        # 同時啟動前後端服務
        echo "同時啟動前後端服務..."
        
        # 啟動後端
        echo "啟動後端服務..."
        cd "$SCRIPT_DIR"
        python backend/app.py &
        BACKEND_PID=$!
        echo "後端服務已啟動 (PID: $BACKEND_PID)"
        
        # 啟動前端
        echo "啟動前端開發服務器..."
        cd "$SCRIPT_DIR/frontend"
        npm run dev &
        FRONTEND_PID=$!
        echo "前端開發服務器已啟動 (PID: $FRONTEND_PID)"
        
        # 等待用戶終止服務
        echo "按 Ctrl+C 終止服務..."
        trap "kill $BACKEND_PID $FRONTEND_PID; echo '服務已終止'; exit" INT
        wait
        ;;
    4)
        # 退出
        echo "退出腳本"
        exit 0
        ;;
    *)
        echo "無效選項"
        exit 1
        ;;
esac 