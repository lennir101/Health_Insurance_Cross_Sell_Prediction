#!/usr/bin/env python3
"""
複製模型文件到應用目錄
"""
import os
import shutil
import argparse
import sys

def main():
    parser = argparse.ArgumentParser(description='複製模型文件到應用目錄')
    parser.add_argument('--model', required=True, help='原始模型文件路徑')
    parser.add_argument('--encoders', required=True, help='原始標籤編碼器文件路徑')
    parser.add_argument('--dest', default=None, help='目標目錄')
    
    args = parser.parse_args()
    
    # 獲取腳本目錄
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 設置目標目錄
    if args.dest:
        dest_dir = args.dest
    else:
        dest_dir = os.path.join(script_dir, '..', 'backend', 'ml_models')
    
    # 確保目標目錄存在
    os.makedirs(dest_dir, exist_ok=True)
    
    # 檢查源文件是否存在
    if not os.path.exists(args.model):
        print(f"錯誤: 模型文件不存在: {args.model}")
        sys.exit(1)
    
    if not os.path.exists(args.encoders):
        print(f"錯誤: 標籤編碼器文件不存在: {args.encoders}")
        sys.exit(1)
    
    # 複製文件
    try:
        model_dest = os.path.join(dest_dir, 'final_model.joblib')
        encoders_dest = os.path.join(dest_dir, 'label_encoders.joblib')
        
        shutil.copy2(args.model, model_dest)
        shutil.copy2(args.encoders, encoders_dest)
        
        print(f"✅ 模型文件已複製到: {model_dest}")
        print(f"✅ 標籤編碼器已複製到: {encoders_dest}")
    except Exception as e:
        print(f"❌ 複製文件時出錯: {str(e)}")
        sys.exit(1)

if __name__ == '__main__':
    main() 