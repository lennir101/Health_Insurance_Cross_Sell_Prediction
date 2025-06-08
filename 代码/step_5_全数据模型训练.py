"""
所得结果采用的最后一次精调所得结果，以F1得分为优先指标

{
  "num_leaves": 11,
  "max_depth": 11,
  "subsample": 0.11769756360946987,
  "colsample_bytree": 0.29572538572787305,
  "scale_pos_weight": 1.7061180004294085,
  "min_child_samples": 75,
  "min_child_weight": 0.009613097955749644,
  "reg_alpha": 0.00314138443087681,
  "reg_lambda": 5.205819397783783,
  "threshold": 0.3329736384164349
  "n_estimators":528
  "boosting_type": "gbdt",
  "learning_rate": 0.05,

  "random_state": 42,
}
"""

import os
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from datetime import datetime
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import (
    roc_curve, auc,
    recall_score, f1_score,
    confusion_matrix
)
from sklearn.preprocessing import LabelEncoder

# ─────────────────────────────────────────────────────────────────────────────
# 0. 路径设置
# ─────────────────────────────────────────────────────────────────────────────
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
output_base_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_5_最终模型"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
out_dir = os.path.join(output_base_path, f"final_model_fixed_params_{timestamp}")
os.makedirs(out_dir, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────────
# 1. 直接载入固定超参数
# ─────────────────────────────────────────────────────────────────────────────
fixed_params = {
    "boosting_type": "gbdt",
    "learning_rate": 0.05,
    "n_estimators": 528,
    "num_leaves": 11,
    "max_depth": 11,
    "subsample": 0.11769756360946987,
    "colsample_bytree": 0.29572538572787305,
    "scale_pos_weight": 1.7061180004294085,
    "min_child_samples": 75,
    "min_child_weight": 0.009613097955749644,
    "reg_alpha": 0.00314138443087681,
    "reg_lambda": 5.205819397783783,
    "random_state": 42,
    "n_jobs": 3,
    "min_split_gain": 0.001,
}
threshold = 0.3329736384164349

# ─────────────────────────────────────────────────────────────────────────────
# 2. 读取并编码数据（同时构建并保存 LabelEncoder 实例）
# ─────────────────────────────────────────────────────────────────────────────
df = pd.read_csv(file_path)
y  = df["Response"]
X  = df.drop(columns=["Response", "id"], errors="ignore")

# 1) 構建一個 dict 來保存所有的 LabelEncoder
label_encoders = {}
# 自動偵測所有 object 欄位，逐欄 fit 一個 LabelEncoder
for col in X.select_dtypes(include="object"):
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    label_encoders[col] = le

# ─────────────────────────────────────────────────────────────────────────────
# 3. 5 折 CV 评估
# ─────────────────────────────────────────────────────────────────────────────
kf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

tprs = []
aucs = []
mean_fpr = np.linspace(0, 1, 100)
recalls = []
f1s = []

with open(os.path.join(out_dir, "metrics.txt"), "w", encoding="utf-8") as log:
    log.write(f"Fixed params evaluation ({timestamp})\n\n")

    for fold, (train_idx, valid_idx) in enumerate(kf.split(X, y), 1):
        X_tr, X_val = X.iloc[train_idx], X.iloc[valid_idx]
        y_tr, y_val = y.iloc[train_idx], y.iloc[valid_idx]

        model = LGBMClassifier(**fixed_params)
        model.fit(X_tr, y_tr)

        prob = model.predict_proba(X_val)[:, 1]
        pred = (prob > threshold).astype(int)

        r = recall_score(y_val, pred)
        f = f1_score(y_val, pred)
        fpr, tpr, _ = roc_curve(y_val, prob)
        roc_auc = auc(fpr, tpr)

        recalls.append(r)
        f1s.append(f)
        aucs.append(roc_auc)

        interp_tpr = np.interp(mean_fpr, fpr, tpr)
        interp_tpr[0] = 0.0
        tprs.append(interp_tpr)

        line = f"Fold {fold}: Recall={r:.4f}, F1={f:.4f}, AUC={roc_auc:.4f}\n"
        print(line, end="")
        log.write(line)

    # 平均指标
    mean_recall = np.mean(recalls)
    mean_f1     = np.mean(f1s)
    mean_auc_cv = np.mean(aucs)
    summary = (
        f"\nMean Recall = {mean_recall:.4f} ± {np.std(recalls):.4f}\n"
        f"Mean F1     = {mean_f1:.4f} ± {np.std(f1s):.4f}\n"
        f"Mean AUC    = {mean_auc_cv:.4f} ± {np.std(aucs):.4f}\n"
    )
    print(summary)
    log.write(summary)

# ─────────────────────────────────────────────────────────────────────────────
# 4. 绘制并保存平均 ROC 曲线
# ─────────────────────────────────────────────────────────────────────────────
plt.figure(figsize=(8, 6))
plt.plot([0,1], [0,1], "--", color="gray")
mean_tpr = np.mean(tprs, axis=0)
mean_tpr[-1] = 1.0
plt.plot(mean_fpr, mean_tpr,
         label=f"Mean ROC (AUC={mean_auc_cv:.4f})", lw=2)
plt.xlabel("False Positive Rate")
plt.ylabel("True Positive Rate")
plt.title("ROC Curve (5-fold CV)")
plt.legend(loc="lower right")
plt.grid(True)
plt.tight_layout()
path = os.path.join(out_dir, "roc_curve_cv.png")
plt.savefig(path); plt.close()

# ─────────────────────────────────────────────────────────────────────────────
# 5. 混淆矩阵（cross-val predict）
# ─────────────────────────────────────────────────────────────────────────────
probs_all = cross_val_predict(
    LGBMClassifier(**fixed_params), X, y,
    cv=kf, method="predict_proba"
)[:,1]
preds_all = (probs_all > threshold).astype(int)

cm = confusion_matrix(y, preds_all)
plt.figure(figsize=(5, 5))
plt.imshow(cm, cmap="Blues", interpolation="nearest")
for i in range(cm.shape[0]):
    for j in range(cm.shape[1]):
        plt.text(j, i, cm[i,j],
                 ha="center", va="center",
                 color="white" if cm[i,j]>cm.max()/2 else "black")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix (CV)")
plt.tight_layout()
path = os.path.join(out_dir, "confusion_matrix.png")
plt.savefig(path); plt.close()

# ─────────────────────────────────────────────────────────────────────────────
# 6. 全量训练、特征重要性 & 模型保存
# ─────────────────────────────────────────────────────────────────────────────
final_model = LGBMClassifier(**fixed_params)
final_model.fit(X, y)

# 特征重要性
imp = final_model.feature_importances_
plt.figure(figsize=(10, 6))
plt.barh(X.columns, imp)
plt.xlabel("Importance")
plt.title("Feature Importances (Full Model)")
plt.tight_layout()
path = os.path.join(out_dir, "feature_importance_full.png")
plt.savefig(path); plt.close()

# 保存模型
joblib.dump(final_model, os.path.join(out_dir, "final_model.joblib"))

# **保存 LabelEncoder 字典**
encoder_path = os.path.join(out_dir, "label_encoders.joblib")
joblib.dump(label_encoders, encoder_path)
print(f"✅ 編碼器已保存：{encoder_path}")

print("\n✅ 全流程完成，所有结果保存在：", out_dir)
