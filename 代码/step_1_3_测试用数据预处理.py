import pandas as pd
import numpy as np
import os

# 输入路径（训练集）
train_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\test.csv"

# 输出路径
output_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive"
os.makedirs(output_path, exist_ok=True)

# 读取数据
train_df = pd.read_csv(train_path)

# 1️⃣ 新增对数保费特征
train_df["Annual_Premium_Log"] = np.log1p(train_df["Annual_Premium"])

# 2️⃣ 年龄段映射函数
def age_group(age):
    if age < 25:
        return "青年"
    elif age < 40:
        return "中年"
    elif age < 60:
        return "中老年"
    else:
        return "老年"

# 应用年龄段标签
train_df["Age_Group"] = train_df["Age"].apply(age_group)

# 3️⃣ 保存增强后的训练集数据
train_df.to_csv(os.path.join(output_path, "test_处理后数据.csv"), index=False, encoding="utf-8-sig")
