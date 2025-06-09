@echo off
REM 保險交叉銷售預測系統啟動腳本 (Windows版)
REM 
REM 此腳本用於啟動前後端服務
REM 如需修改端口，請編輯以下配置文件：
REM - 前端：frontend\src\config\appConfig.ts
REM - 後端：backend\config\server_config.py

echo ========================================
echo 保險交叉銷售預測系統啟動腳本 (Windows版)
echo ========================================

REM 獲取腳本所在目錄
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

REM 提示用戶選擇啟動模式
echo 請選擇啟動模式：
echo 1) 啟動後端服務
echo 2) 啟動前端開發服務器
echo 3) 同時啟動前後端服務
echo 4) 退出
set /p choice="請輸入選項 (1-4): "

if "%choice%"=="1" (
    REM 啟動後端服務
    echo 啟動後端服務...
    echo 注意：如需修改端口，請編輯 backend\config\server_config.py
    cd /d "%SCRIPT_DIR%"
    python backend\app.py
) else if "%choice%"=="2" (
    REM 啟動前端開發服務器
    echo 啟動前端開發服務器...
    echo 注意：如需修改後端連接設置，請編輯 frontend\src\config\appConfig.ts
    cd /d "%SCRIPT_DIR%\frontend"
    npm run dev
) else if "%choice%"=="3" (
    REM 同時啟動前後端服務
    echo 同時啟動前後端服務...
    
    REM 啟動後端
    echo 啟動後端服務...
    start cmd /k "cd /d "%SCRIPT_DIR%" && python backend\app.py"
    
    REM 啟動前端
    echo 啟動前端開發服務器...
    start cmd /k "cd /d "%SCRIPT_DIR%\frontend" && npm run dev"
    
    echo 服務已啟動，請在各自的命令視窗中查看輸出
    echo 關閉命令視窗即可終止服務
) else if "%choice%"=="4" (
    REM 退出
    echo 退出腳本
    exit /b 0
) else (
    echo 無效選項
    exit /b 1
) 