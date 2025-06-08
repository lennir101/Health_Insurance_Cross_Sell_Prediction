import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# 设置路径
data_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\test.csv"
output_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_1_数据探索"

# 创建输出文件夹（如果不存在）
os.makedirs(output_path, exist_ok=True)

# 读取数据
df = pd.read_csv(data_path)

# -------------------------------
# 检查 Annual_Premium 偏态性
# -------------------------------
plt.figure(figsize=(10, 5))
sns.histplot(df["Annual_Premium"], bins=50, kde=True)
plt.title("Annual_Premium 分布图")
plt.xlabel("Annual_Premium")
plt.ylabel("频数")
plt.savefig(os.path.join(output_path, "Annual_Premium_原始分布.png"))
plt.close()

# 对数变换后
df["Annual_Premium_Log"] = np.log1p(df["Annual_Premium"])
plt.figure(figsize=(10, 5))
sns.histplot(df["Annual_Premium_Log"], bins=50, kde=True)
plt.title("Annual_Premium 对数变换后分布")
plt.xlabel("log(Annual_Premium + 1)")
plt.ylabel("频数")
plt.savefig(os.path.join(output_path, "Annual_Premium_对数分布.png"))
plt.close()

# -------------------------------
# 基础可视化：变量 vs 保费
# -------------------------------
categorical_columns = ["Gender", "Vehicle_Age", "Vehicle_Damage", "Driving_License", "Previously_Insured"]

for col in categorical_columns:
    plt.figure(figsize=(8, 5))
    sns.boxplot(x=col, y="Annual_Premium", data=df)
    plt.title(f"{col} 与 Annual_Premium 的关系")
    plt.savefig(os.path.join(output_path, f"{col}_vs_Annual_Premium.png"))
    plt.close()

# 若存在 'Response' 字段，可以画响应分析图（分类柱状图）
if 'Response' in df.columns:
    for col in categorical_columns:
        plt.figure(figsize=(6, 4))
        sns.countplot(x=col, hue="Response", data=df)
        plt.title(f"{col} vs Response")
        plt.savefig(os.path.join(output_path, f"{col}_vs_Response.png"))
        plt.close()

# 可选：Vintage / Age 分布
plt.figure(figsize=(10, 5))
sns.histplot(df["Vintage"], bins=50, kde=True)
plt.title("Vintage 分布")
plt.savefig(os.path.join(output_path, "Vintage_分布.png"))
plt.close()

if "Age" in df.columns:
    plt.figure(figsize=(10, 5))
    sns.histplot(df["Age"], bins=50, kde=True)
    plt.title("Age 分布")
    plt.savefig(os.path.join(output_path, "Age_分布.png"))
    plt.close()
