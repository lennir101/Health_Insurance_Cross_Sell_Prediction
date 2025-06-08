import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from lightgbm import LGBMClassifier
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import f1_score, recall_score, precision_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import os

# 路径设置
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
output_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_2_手动粗调结果"
os.makedirs(output_path, exist_ok=True)

# 数据读取与编码
df = pd.read_csv(file_path)
y = df["Response"]
X = df.drop(columns=["Response", "id"], errors="ignore")
for col in X.select_dtypes(include='object').columns:
    X[col] = LabelEncoder().fit_transform(X[col])

# 抽样与固定参数
X_sample, _, y_sample, _ = train_test_split(X, y, train_size=0.1, stratify=y, random_state=42)
fixed_threshold = 0.33
fixed_scale_pos_weight = 2.0
fixed_boosting_type = "gbdt"
fixed_num_leaves = 6
fixed_max_depth = 5
fixed_subsample = 0.5
fixed_colsample = 0.65

# min_child_samples 参数探索
sample_values = list(range(10, 151, 5))
f1_scores, recalls, precisions, aucs, tree_counts = [], [], [], [], []

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for m in sample_values:
    f1_fold, recall_fold, precision_fold, auc_fold, iter_fold = [], [], [], [], []

    for train_idx, valid_idx in cv.split(X_sample, y_sample):
        X_train, X_valid = X_sample.iloc[train_idx], X_sample.iloc[valid_idx]
        y_train, y_valid = y_sample.iloc[train_idx], y_sample.iloc[valid_idx]

        model = LGBMClassifier(
            boosting_type=fixed_boosting_type,
            num_leaves=fixed_num_leaves,
            max_depth=fixed_max_depth,
            subsample=fixed_subsample,
            colsample_bytree=fixed_colsample,
            min_child_samples=m,
            learning_rate=0.05,
            n_estimators=1000,
            early_stopping_rounds=30,
            scale_pos_weight=fixed_scale_pos_weight,
            random_state=42,
            n_jobs=-1
        )

        model.fit(X_train, y_train, eval_set=[(X_valid, y_valid)], callbacks=[])
        y_prob = model.predict_proba(X_valid)[:, 1]
        y_pred = (y_prob > fixed_threshold).astype(int)

        f1_fold.append(f1_score(y_valid, y_pred))
        recall_fold.append(recall_score(y_valid, y_pred))
        precision_fold.append(precision_score(y_valid, y_pred))
        auc_fold.append(roc_auc_score(y_valid, y_prob))
        iter_fold.append(model.best_iteration_)

    f1_scores.append(np.mean(f1_fold))
    recalls.append(np.mean(recall_fold))
    precisions.append(np.mean(precision_fold))
    aucs.append(np.mean(auc_fold))
    tree_counts.append(np.mean(iter_fold))

# 结果输出
best_idx = np.argmax(f1_scores)
best_val = sample_values[best_idx]
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

# 图像
plt.figure(figsize=(10, 6))
plt.plot(sample_values, f1_scores, label="F1-score", marker='o')
plt.plot(sample_values, recalls, label="Recall", linestyle='--')
plt.plot(sample_values, precisions, label="Precision", linestyle='-.')
plt.plot(sample_values, aucs, label="AUC", linestyle=':', marker='^')
plt.xlabel("min_child_samples")
plt.ylabel("Score")
plt.title("min_child_samples vs F1 / Recall / Precision / AUC (CV=5)")
plt.grid()
plt.legend()
plt.savefig(os.path.join(output_path, f"min_child_samples_comparison_cv_{timestamp}.png"))
plt.close()

# CSV 输出
pd.DataFrame({
    "min_child_samples": sample_values,
    "F1_score": f1_scores,
    "Recall": recalls,
    "Precision": precisions,
    "AUC": aucs,
    "Avg_Best_Iteration": tree_counts
}).to_csv(os.path.join(output_path, f"min_child_samples_metrics_cv_{timestamp}.csv"), index=False, encoding="utf-8-sig")

# 日志记录
with open(os.path.join(output_path, f"min_child_samples_best_log_cv_{timestamp}.txt"), "w", encoding="utf-8") as f:
    f.write("min_child_samples 5折交叉验证调参报告\n")
    f.write(f"时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write(f"固定参数：boosting_type={fixed_boosting_type}, num_leaves={fixed_num_leaves}, max_depth={fixed_max_depth}, subsample={fixed_subsample}, colsample_bytree={fixed_colsample}, scale_pos_weight={fixed_scale_pos_weight}, threshold={fixed_threshold}\n")
    f.write(f"最佳 min_child_samples：{best_val}\n")
    f.write(f"F1-score：{f1_scores[best_idx]:.4f}\n")
    f.write(f"Recall：{recalls[best_idx]:.4f}\n")
    f.write(f"Precision：{precisions[best_idx]:.4f}\n")
    f.write(f"AUC：{aucs[best_idx]:.4f}\n")
    f.write(f"平均最佳树数（best_iteration_）：{int(tree_counts[best_idx])}\n")
