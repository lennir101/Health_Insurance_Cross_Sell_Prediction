import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from lightgbm import LGBMClassifier, early_stopping
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import f1_score, recall_score, precision_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
from tqdm import tqdm
import os
import json
import random

# ✅ 路径设置
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
output_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_3_随机搜索调参结果"
os.makedirs(output_path, exist_ok=True)

# ✅ 数据读取与编码
df = pd.read_csv(file_path)
y = df["Response"]
X = df.drop(columns=["Response", "id"], errors="ignore")
for col in X.select_dtypes(include='object').columns:
    X[col] = LabelEncoder().fit_transform(X[col])

# ✅ 使用 30% 数据进行随机搜索
X_sample, _, y_sample, _ = train_test_split(X, y, train_size=0.3, stratify=y, random_state=42)

param_space = {
    "threshold": [0.15, 0.20, 0.25, 0.30, 0.35],  # 维持
    "scale_pos_weight": [1.0, 1.2, 1.4, 1.6, 1.8],  # 维持
    "num_leaves": list(range(4, 10)),  # 维持
    "max_depth": list(range(5, 22, 2)),  # 维持
    "subsample": [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45],  # 细分到0.05～0.46
    "colsample_bytree": [0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6],  # 细分到0.25～0.6
    "min_child_samples": list(range(30, 166, 15)),  # 保持
    "min_child_weight": [0.0005, 0.001, 0.002, 0.003, 0.004, 0.008, 0.01, 0.015],  # 增加0.01、0.015
    "reg_alpha": [0, 0.001, 0.002, 0.003, 0.004],  # 维持
    "reg_lambda": [0.5, 1.0, 1.5, 2.0, 2.5, 3.5, 5, 6],  # 扩大到6
}





# ✅ 随机抽取组合
n_iter = 800  # 你可以调整这个值压缩运行时间
random.seed(42)
random_combinations = [dict(zip(param_space.keys(), [random.choice(v) for v in param_space.values()])) for _ in range(n_iter)]

# ✅ 交叉验证器
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

results = []
best_score = -1
best_params = None

# ✅ 主循环：随机搜索
for i, params in enumerate(tqdm(random_combinations, desc="Random Search")):
    fold_scores = {"auc": [], "f1": [], "recall": [], "precision": [], "best_iter": []}

    for train_idx, valid_idx in cv.split(X_sample, y_sample):
        X_train, X_valid = X_sample.iloc[train_idx], X_sample.iloc[valid_idx]
        y_train, y_valid = y_sample.iloc[train_idx], y_sample.iloc[valid_idx]

        model = LGBMClassifier(
            boosting_type='gbdt',
            learning_rate=0.05,
            n_estimators=1000,
            num_leaves=params["num_leaves"],
            max_depth=params["max_depth"],
            subsample=params["subsample"],
            colsample_bytree=params["colsample_bytree"],
            scale_pos_weight=params["scale_pos_weight"],
            min_child_samples=params["min_child_samples"],
            min_child_weight=params["min_child_weight"],
            reg_alpha=params["reg_alpha"],
            reg_lambda=params["reg_lambda"],
            random_state=42,
            n_jobs= 3,
            min_split_gain = 0.001
        )

        model.fit(X_train, y_train, eval_set=[(X_valid, y_valid)],
                  callbacks=[early_stopping(stopping_rounds=30, verbose=False)])
        y_prob = model.predict_proba(X_valid)[:, 1]
        y_pred = (y_prob > params["threshold"]).astype(int)

        fold_scores["auc"].append(roc_auc_score(y_valid, y_prob))
        fold_scores["f1"].append(f1_score(y_valid, y_pred))
        fold_scores["recall"].append(recall_score(y_valid, y_pred))
        fold_scores["precision"].append(precision_score(y_valid, y_pred))
        fold_scores["best_iter"].append(model.best_iteration_)

    result = {
        **params,
        "AUC": np.mean(fold_scores["auc"]),
        "F1_score": np.mean(fold_scores["f1"]),
        "Recall": np.mean(fold_scores["recall"]),
        "Precision": np.mean(fold_scores["precision"]),
        "Avg_Best_Iteration": np.mean(fold_scores["best_iter"]),
    }
    results.append(result)

    if result["F1_score"] > best_score:
        best_score = result["F1_score"]
        best_params = result

# ✅ 保存完整结果
df_results = pd.DataFrame(results)
df_results.to_csv(os.path.join(output_path, f"random_search_results_{timestamp}.csv"), index=False, encoding="utf-8-sig")

# ✅ 保存 F1-score 前十组合
top10_df = df_results.sort_values(by="F1_score", ascending=False).head(10)
top10_df.to_csv(os.path.join(output_path, f"top10_by_f1_{timestamp}.csv"), index=False, encoding="utf-8-sig")

# ✅ 日志
with open(os.path.join(output_path, f"best_params_log_{timestamp}.txt"), "w", encoding="utf-8") as f:
    f.write("LightGBM 随机搜索调参报告\n")
    f.write(f"时间：{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
    f.write("最佳参数组合如下：\n")
    json.dump(best_params, f, indent=2, ensure_ascii=False)

# ✅ 生成超参数趋势图
for param in param_space.keys():
    if param not in df_results.columns:
        continue
    plt.figure(figsize=(8, 5))
    df_results.groupby(param)["F1_score"].mean().plot(marker="o")
    plt.title(f"{param} vs F1-score")
    plt.xlabel(param)
    plt.ylabel("F1-score")
    plt.grid()
    plt.savefig(os.path.join(output_path, f"{param}_trend_{timestamp}.png"))
    plt.close()

print(f"✅ 随机搜索完成，总尝试组合数：{n_iter}，最佳F1-score={best_score:.4f}")
