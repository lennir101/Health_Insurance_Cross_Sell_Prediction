import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from lightgbm import LGBMClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, precision_score, recall_score
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import os

# 路径设置
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
output_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_2_手动粗调结果"

os.makedirs(output_path, exist_ok=True)

# 读取数据
df = pd.read_csv(file_path)
y = df["Response"]
X = df.drop(columns=["Response", "id"], errors="ignore")

# LabelEncoder 编码类别特征
categorical_cols = X.select_dtypes(include='object').columns
le = LabelEncoder()
for col in categorical_cols:
    X[col] = le.fit_transform(X[col])

# 使用 10% 数据
X_sample, _, y_sample, _ = train_test_split(X, y, train_size=0.1, stratify=y, random_state=42)

# 经验值设置 scale_pos_weight
scale_pos_weight = (y_sample == 0).sum() / (y_sample == 1).sum()

# 模型训练
model = LGBMClassifier(
    num_leaves=31,
    learning_rate=0.05,
    n_estimators=1000,
    early_stopping_rounds=30,
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    n_jobs=-1
)

X_train, X_valid, y_train, y_valid = train_test_split(X_sample, y_sample, test_size=0.3, stratify=y_sample, random_state=42)
model.fit(X_train, y_train, eval_set=[(X_valid, y_valid)], callbacks=[])

# 获取概率
y_prob = model.predict_proba(X_valid)[:, 1]

# 不同阈值下评估
thresholds = np.arange(0.05, 0.50, 0.01)
f1_scores, recalls, precisions = [], [], []

for t in thresholds:
    y_pred = (y_prob > t).astype(int)
    f1_scores.append(f1_score(y_valid, y_pred))
    recalls.append(recall_score(y_valid, y_pred))
    precisions.append(precision_score(y_valid, y_pred))

# 找最佳 F1 阈值
best_idx = np.argmax(f1_scores)
best_threshold = thresholds[best_idx]

# 时间戳
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# 绘图
plt.figure(figsize=(10, 6))
plt.plot(thresholds, f1_scores, label="F1-score", marker='o')
plt.plot(thresholds, recalls, label="Recall", linestyle='--')
plt.plot(thresholds, precisions, label="Precision", linestyle='-.')
plt.xlabel("Threshold")
plt.ylabel("Score")
plt.title("阈值 vs F1 / Recall / Precision")
plt.legend()
plt.grid()
plt.savefig(os.path.join(output_path, f"threshold_f1_recall_precision_{timestamp}.png"))
plt.close()

# 保存表格
results_df = pd.DataFrame({
    "Threshold": thresholds,
    "F1_score": f1_scores,
    "Recall": recalls,
    "Precision": precisions
})
csv_path = os.path.join(output_path, f"threshold_metrics_{timestamp}.csv")
results_df.to_csv(csv_path, index=False, encoding="utf-8-sig")

# 保存日志
with open(os.path.join(output_path, f"threshold_best_log_{timestamp}.txt"), "w", encoding="utf-8") as f:
    f.write("最佳阈值搜索报告\n")
    f.write(f"时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"最佳阈值：{best_threshold:.2f}\n")
    f.write(f"F1-score：{f1_scores[best_idx]:.4f}\n")
    f.write(f"Recall：{recalls[best_idx]:.4f}\n")
    f.write(f"Precision：{precisions[best_idx]:.4f}\n")
