import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from datetime import datetime
from sklearn.metrics import (
    confusion_matrix,
    precision_score, recall_score, f1_score, accuracy_score, roc_auc_score, roc_curve
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# ─────────────────────────────────────────────────────────────────────────────
# 0. 路径设置
# ─────────────────────────────────────────────────────────────────────────────
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
model_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_5_最终模型\final_model_fixed_params_20250512_165711\final_model.joblib"
output_base = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_6_测试"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
out_dir = os.path.join(output_base, f"prediction_{timestamp}")
os.makedirs(out_dir, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. 数据读取与编码
# ─────────────────────────────────────────────────────────────────────────────
df = pd.read_csv(file_path)
y = df["Response"]
X = df.drop(columns=["Response", "id"], errors="ignore")

# 同训练时的 LabelEncoder 逻辑
for col in X.select_dtypes(include="object"):
    X[col] = LabelEncoder().fit_transform(X[col])

# ─────────────────────────────────────────────────────────────────────────────
# 2. 拆分 40% 样本用作“测试集”
# ─────────────────────────────────────────────────────────────────────────────
X_train_unused, X_test, y_train_unused, y_test = train_test_split(
    X, y, test_size=0.4, stratify=y, random_state=42
)

# ─────────────────────────────────────────────────────────────────────────────
# 3. 载入模型并预测
# ─────────────────────────────────────────────────────────────────────────────
model = joblib.load(model_path)
# 如果你使用了自定义 threshold，直接用 predict_proba
# 这里假设模型内部没有 threshold 参数，统一阈值 0.5，如有特殊阈值自行修改
y_prob = model.predict_proba(X_test)[:, 1]
y_pred = (y_prob > 0.3329736384164349).astype(int)

# ─────────────────────────────────────────────────────────────────────────────
# 4. 计算各种指标
# ─────────────────────────────────────────────────────────────────────────────
acc   = accuracy_score(y_test, y_pred)
prec  = precision_score(y_test, y_pred, zero_division=0)
rec   = recall_score(y_test, y_pred)
f1    = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

# 打印并写入 metrics.txt
with open(os.path.join(out_dir, "metrics.txt"), "w", encoding="utf-8") as f:
    f.write(f"Prediction report ({timestamp})\n\n")
    f.write(f"Accuracy : {acc:.4f}\n")
    f.write(f"Precision: {prec:.4f}\n")
    f.write(f"Recall   : {rec:.4f}\n")
    f.write(f"F1-score : {f1:.4f}\n")
    f.write(f"ROC AUC  : {roc_auc:.4f}\n")

print(f"Accuracy : {acc:.4f}")
print(f"Precision: {prec:.4f}")
print(f"Recall   : {rec:.4f}")
print(f"F1-score : {f1:.4f}")
print(f"ROC AUC  : {roc_auc:.4f}")

# ─────────────────────────────────────────────────────────────────────────────
# 5. 绘制并保存混淆矩阵
# ─────────────────────────────────────────────────────────────────────────────
cm = confusion_matrix(y_test, y_pred)
plt.figure(figsize=(5,5))
plt.imshow(cm, cmap="Blues", interpolation="nearest")
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(j, i, cm[i,j],
                 ha="center", va="center",
                 color="white" if cm[i,j] > cm.max()/2 else "black")
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.tight_layout()
plt.savefig(os.path.join(out_dir, "confusion_matrix.png"))
plt.close()

# ─────────────────────────────────────────────────────────────────────────────
# 6. 绘制并保存 ROC 曲线
# ─────────────────────────────────────────────────────────────────────────────
fpr, tpr, _ = roc_curve(y_test, y_prob)
plt.figure(figsize=(8,6))
plt.plot([0,1], [0,1], "--", color="gray")
plt.plot(fpr, tpr, lw=2, label=f"AUC = {roc_auc:.4f}")
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve (on 40% hold-out)")
plt.legend(loc="lower right")
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(out_dir, "roc_curve.png"))
plt.close()

print(f"\n✅ 预测完成，所有结果保存在：\n{out_dir}")
