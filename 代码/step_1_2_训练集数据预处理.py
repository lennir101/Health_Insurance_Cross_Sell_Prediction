import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

# 设置路径（可以换成 train.csv 或 test.csv）
data_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train.csv"
output_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_1_数据预处理"

os.makedirs(output_path, exist_ok=True)

# ✅ 原始数据读取
df = pd.read_csv(data_path)

# ✅ 新增特征：Annual_Premium_Log
df["Annual_Premium_Log"] = np.log1p(df["Annual_Premium"])

# ✅ 新增特征：Age_Group
def age_group(age):
    if age < 25:
        return "青年"
    elif age < 40:
        return "中年"
    elif age < 60:
        return "中老年"
    else:
        return "老年"
df["Age_Group"] = df["Age"].apply(age_group)

# ✅ 保留原始列顺序 + 只添加新特征（附加列）
original_columns = list(pd.read_csv(data_path, nrows=1).columns)
new_columns = [col for col in df.columns if col not in original_columns]
final_columns = original_columns + new_columns
df = df[final_columns]

# ✅ 保存增强后的数据
df.to_csv(os.path.join(output_path, "train_处理后数据.csv"), index=False, encoding="utf-8-sig")

# ✅ 可视化：Annual_Premium 原始分布
plt.figure(figsize=(10, 5))
sns.histplot(df["Annual_Premium"], bins=50, kde=True)
plt.title("Annual_Premium 原始分布")
plt.savefig(os.path.join(output_path, "Annual_Premium_原始分布.png"))
plt.close()

# ✅ Annual_Premium 对数分布
plt.figure(figsize=(10, 5))
sns.histplot(df["Annual_Premium_Log"], bins=50, kde=True)
plt.title("Annual_Premium 对数变换后分布")
plt.savefig(os.path.join(output_path, "Annual_Premium_对数分布.png"))
plt.close()

# ✅ 年龄分布
plt.figure(figsize=(10, 5))
sns.histplot(df["Age"], bins=50, kde=True)
plt.title("Age 分布")
plt.savefig(os.path.join(output_path, "Age_分布.png"))
plt.close()

# ✅ 年龄段柱状图
plt.figure(figsize=(8, 5))
sns.countplot(x="Age_Group", data=df, order=["青年", "中年", "中老年", "老年"])
plt.title("年龄段分布")
plt.savefig(os.path.join(output_path, "Age_Group_柱状图.png"))
plt.close()

# ✅ 年龄段 vs 保费箱型图
plt.figure(figsize=(8, 5))
sns.boxplot(x="Age_Group", y="Annual_Premium", data=df, order=["青年", "中年", "中老年", "老年"])
plt.title("年龄段 vs Annual_Premium")
plt.savefig(os.path.join(output_path, "AgeGroup_vs_AnnualPremium.png"))
plt.close()

# ✅ 年龄段保费统计表
group_stats = df.groupby("Age_Group")["Annual_Premium"].agg(["mean", "median", "count", "std"]).reset_index()
group_stats.to_csv(os.path.join(output_path, "train_年龄段_保费统计表.csv"), index=False, encoding="utf-8-sig")
