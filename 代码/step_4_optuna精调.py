import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import optuna
from lightgbm import LGBMClassifier, early_stopping
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import f1_score, recall_score, precision_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import json
import os

# ✅ 路径设置
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
output_base_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_4_optuma精调"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_path = os.path.join(output_base_path, f"optuna_results_{timestamp}")
os.makedirs(output_path, exist_ok=True)

# ✅ 数据读取与编码
df = pd.read_csv(file_path)
y = df["Response"]
X = df.drop(columns=["Response", "id"], errors="ignore")
for col in X.select_dtypes(include='object').columns:
    X[col] = LabelEncoder().fit_transform(X[col])

# ✅ 使用 50% 数据样本
X_sample, _, y_sample, _ = train_test_split(X, y, train_size=0.5, stratify=y, random_state=42)

# ✅ 交叉验证器
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# ✅ optuna目标函数（更新后的参数区间）
def objective(trial):
    params = {
        "boosting_type": "gbdt",
        "learning_rate": 0.05,
        "n_estimators": 1000,
        "num_leaves": trial.suggest_int("num_leaves", 3, 11),
        "max_depth": trial.suggest_int("max_depth", 8, 32),
        "subsample": trial.suggest_float("subsample", 0.02, 0.2),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.12, 0.24),
        "scale_pos_weight": trial.suggest_float("scale_pos_weight", 2.6, 3.6),
        "min_child_samples": trial.suggest_int("min_child_samples", 30, 80),
        "min_child_weight": trial.suggest_float("min_child_weight", 0.0004, 0.024),
        "reg_alpha": trial.suggest_float("reg_alpha", 0.0016, 0.0028),
        "reg_lambda": trial.suggest_float("reg_lambda", 0.001, 3.0),

        "random_state": 42,
        "n_jobs": 3,
        "min_split_gain": 0.001,
    }

    # ✅ threshold：左侧延拓至 0.25，右边保持不变
    threshold = trial.suggest_float("threshold", 0.1, 0.2)



    fold_f1 = []
    fold_auc = []
    fold_precision = []
    fold_recall = []
    best_iterations = []

    for train_idx, valid_idx in cv.split(X_sample, y_sample):
        X_train, X_valid = X_sample.iloc[train_idx], X_sample.iloc[valid_idx]
        y_train, y_valid = y_sample.iloc[train_idx], y_sample.iloc[valid_idx]

        model = LGBMClassifier(**params)
        model.fit(
            X_train, y_train,
            eval_set=[(X_valid, y_valid)],
            callbacks=[early_stopping(stopping_rounds=30, verbose=False)]
        )

        y_prob = model.predict_proba(X_valid)[:, 1]
        y_pred = (y_prob > threshold).astype(int)

        fold_f1.append(f1_score(y_valid, y_pred))
        fold_auc.append(roc_auc_score(y_valid, y_prob))
        fold_precision.append(precision_score(y_valid, y_pred))
        fold_recall.append(recall_score(y_valid, y_pred))
        best_iterations.append(model.best_iteration_)

    trial.set_user_attr("f1", np.mean(fold_f1))
    trial.set_user_attr("auc", np.mean(fold_auc))
    trial.set_user_attr("precision", np.mean(fold_precision))
    trial.set_user_attr("recall", np.mean(fold_recall))
    trial.set_user_attr("avg_best_iteration", np.mean(best_iterations))

    return np.mean(fold_recall)

# ✅ 开始optuna调参
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=300, show_progress_bar=True)

# ✅ 保存最佳超参数
best_params = study.best_trial.params
with open(os.path.join(output_path, "best_params_optuna.json"), "w", encoding="utf-8") as f:
    json.dump(best_params, f, indent=2, ensure_ascii=False)

# ✅ 保存前10个 trial 指标
top_trials = sorted(study.trials, key=lambda x: x.user_attrs.get("f1", -1), reverse=True)[:10]

top10_data = []
for t in top_trials:
    record = {**t.params}
    record.update({
        "f1_score": t.user_attrs["f1"],
        "auc": t.user_attrs["auc"],
        "precision": t.user_attrs["precision"],
        "recall": t.user_attrs["recall"],
        "avg_best_iteration": t.user_attrs["avg_best_iteration"],
    })
    top10_data.append(record)

df_top10 = pd.DataFrame(top10_data)
df_top10.to_csv(os.path.join(output_path, "top10_trials_metrics.csv"), index=False, encoding="utf-8-sig")

# ✅ 绘制特征重要性图（基于最佳模型）
model_best = LGBMClassifier(**best_params, learning_rate=0.05, n_estimators=1000)
model_best.fit(X_sample, y_sample)
importances = model_best.feature_importances_
feat_names = X_sample.columns

plt.figure(figsize=(10, 6))
plt.barh(feat_names, importances)
plt.title("Feature Importances")
plt.xlabel("Importance")
plt.tight_layout()
plt.savefig(os.path.join(output_path, "feature_importance.png"))
plt.close()

# ✅ 绘制超参数重要性图
optuna.visualization.matplotlib.plot_param_importances(study)
plt.tight_layout()
plt.savefig(os.path.join(output_path, "hyperparameter_importance.png"))
plt.close()

# ✅ 绘制每个参数 vs F1-score / Recall 的散点图
params_to_plot = ["threshold", "scale_pos_weight", "num_leaves", "max_depth",
                  "subsample", "colsample_bytree", "min_child_samples",
                  "min_child_weight", "reg_alpha", "reg_lambda"]

df_trials = pd.DataFrame([{**t.params, **t.user_attrs} for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE])

for param in params_to_plot:
    if param not in df_trials.columns:
        continue

    plt.figure(figsize=(8, 5))
    plt.scatter(df_trials[param], df_trials["f1"], label="F1-score", alpha=0.7)
    plt.scatter(df_trials[param], df_trials["recall"], label="Recall", alpha=0.7)
    plt.title(f"{param} vs F1-score & Recall")
    plt.xlabel(param)
    plt.ylabel("Score")
    plt.legend()
    plt.grid()
    plt.tight_layout()
    plt.savefig(os.path.join(output_path, f"{param}_vs_f1_recall.png"))
    plt.close()

print(f"✅ Optuna调参完成！结果保存至: {output_path}")

# ✅ 生成 Optuna 参数交互图（Contour、Slice、Parallel）
import optuna.visualization as vis

# 创建用于存储交互图的子目录
timestamp_interaction = datetime.now().strftime("%Y%m%d_%H%M%S")
interaction_path = os.path.join(output_base_path, f"optuna_interactions_{timestamp_interaction}")
os.makedirs(interaction_path, exist_ok=True)

# ✅ 生成轮廓图（展示参数交互）
param_pairs = [
    ("threshold", "scale_pos_weight"),
    ("subsample", "colsample_bytree"),
    ("min_child_samples", "min_child_weight"),
    ("max_depth", "num_leaves"),
    ("reg_alpha", "reg_lambda")
]

for x, y in param_pairs:
    fig = vis.plot_contour(study, params=[x, y])
    fig.write_image(os.path.join(interaction_path, f"contour_{x}_vs_{y}.png"))

# ✅ 平行坐标图
fig = vis.plot_parallel_coordinate(study)
fig.write_image(os.path.join(interaction_path, "parallel_coordinate.png"))

# ✅ 切片图
fig = vis.plot_slice(study)
fig.write_image(os.path.join(interaction_path, "slice_plot.png"))

# ✅ 参数重要性图（备份）
fig = vis.plot_param_importances(study)
fig.write_image(os.path.join(interaction_path, "hyperparameter_importance.png"))

print(f"✅ 参数交互图生成完成，保存至: {interaction_path}")

# ---------------------------
# 5. Best-value 历史图
# ---------------------------
import optuna.visualization as vis

# 5.1 Recall 最优值历史（Plotly 版）
fig_rec = vis.plot_optimization_history(study)
fig_rec.update_layout(
    title="Optuna Optimization History (Recall)",
    xaxis_title="Trial",
    yaxis_title="Recall",
)
fig_rec.write_image(os.path.join(output_path, "opt_history_recall_plotly.png"))

# 5.2 F1-score 最优值历史（Matplotlib 版手工画）
#    从 user_attrs 里取 F1
trials_completed = [t for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE]
trial_ids  = [t.number for t in trials_completed]
f1_values  = [t.user_attrs["f1"] for t in trials_completed]

plt.figure(figsize=(8, 5))
plt.plot(trial_ids, f1_values, marker='o', linestyle='-', color='tab:blue', label="F1-score")
plt.title("Optuna Optimization History (F1-score)")
plt.xlabel("Trial Number")
plt.ylabel("F1-score")
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(output_path, "opt_history_f1_matplotlib.png"))
plt.close()

print("✅ Recall/F1 最优值历史图 已保存至：", output_path)





"""
旧版代码  F1分数为指标
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import optuna
from lightgbm import LGBMClassifier, early_stopping
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.metrics import f1_score, recall_score, precision_score, roc_auc_score
from sklearn.preprocessing import LabelEncoder
from datetime import datetime
import json
import os

# ✅ 路径设置
file_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\数据源\archive\train_处理后数据.csv"
output_base_path = r"E:\software\Jetbrains\Python Project\25_1__ML_learn\项目练习_25_4_11_Health Insurance Cross Sell Prediction 🏠 🏥\结果一览\step_4_optuma精调"
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
output_path = os.path.join(output_base_path, f"optuna_results_{timestamp}")
os.makedirs(output_path, exist_ok=True)

# ✅ 数据读取与编码
df = pd.read_csv(file_path)
y = df["Response"]
X = df.drop(columns=["Response", "id"], errors="ignore")
for col in X.select_dtypes(include='object').columns:
    X[col] = LabelEncoder().fit_transform(X[col])

# ✅ 使用 50% 数据样本
X_sample, _, y_sample, _ = train_test_split(X, y, train_size=0.5, stratify=y, random_state=42)

# ✅ 交叉验证器
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# ✅ optuna目标函数（更新后的参数区间）
def objective(trial):
    params = {
        "boosting_type": "gbdt",
        "learning_rate": 0.05,
        "n_estimators": 1000,
        "num_leaves": trial.suggest_int("num_leaves", 5, 13),
        "max_depth": trial.suggest_int("max_depth", 5, 24),
        "subsample": trial.suggest_float("subsample", 0.1, 0.25),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.25, 0.4),
        "scale_pos_weight": trial.suggest_float("scale_pos_weight", 2.0, 2.5),
        "min_child_samples": trial.suggest_int("min_child_samples", 50, 100),
        "min_child_weight": trial.suggest_float("min_child_weight", 0.0004, 0.015),
        "reg_alpha": trial.suggest_float("reg_alpha", 0.0016, 0.003),
        "reg_lambda": trial.suggest_float("reg_lambda", 0.5, 6.0),

        "random_state": 42,
        "n_jobs": 3,
        "min_split_gain": 0.001,
    }

    # ✅ threshold：左侧延拓至 0.25，右边保持不变
    threshold = trial.suggest_float("threshold", 0.26, 0.4)



    fold_f1 = []
    fold_auc = []
    fold_precision = []
    fold_recall = []
    best_iterations = []

    for train_idx, valid_idx in cv.split(X_sample, y_sample):
        X_train, X_valid = X_sample.iloc[train_idx], X_sample.iloc[valid_idx]
        y_train, y_valid = y_sample.iloc[train_idx], y_sample.iloc[valid_idx]

        model = LGBMClassifier(**params)
        model.fit(
            X_train, y_train,
            eval_set=[(X_valid, y_valid)],
            callbacks=[early_stopping(stopping_rounds=30, verbose=False)]
        )

        y_prob = model.predict_proba(X_valid)[:, 1]
        y_pred = (y_prob > threshold).astype(int)

        fold_f1.append(f1_score(y_valid, y_pred))
        fold_auc.append(roc_auc_score(y_valid, y_prob))
        fold_precision.append(precision_score(y_valid, y_pred))
        fold_recall.append(recall_score(y_valid, y_pred))
        best_iterations.append(model.best_iteration_)

    trial.set_user_attr("f1", np.mean(fold_f1))
    trial.set_user_attr("auc", np.mean(fold_auc))
    trial.set_user_attr("precision", np.mean(fold_precision))
    trial.set_user_attr("recall", np.mean(fold_recall))
    trial.set_user_attr("avg_best_iteration", np.mean(best_iterations))

    return np.mean(fold_f1)

# ✅ 开始optuna调参
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=300, show_progress_bar=True)

# ✅ 保存最佳超参数
best_params = study.best_trial.params
with open(os.path.join(output_path, "best_params_optuna.json"), "w", encoding="utf-8") as f:
    json.dump(best_params, f, indent=2, ensure_ascii=False)

# ✅ 保存前10个 trial 指标
top_trials = sorted(study.trials, key=lambda x: x.user_attrs.get("f1", -1), reverse=True)[:10]

top10_data = []
for t in top_trials:
    record = {**t.params}
    record.update({
        "f1_score": t.user_attrs["f1"],
        "auc": t.user_attrs["auc"],
        "precision": t.user_attrs["precision"],
        "recall": t.user_attrs["recall"],
        "avg_best_iteration": t.user_attrs["avg_best_iteration"],
    })
    top10_data.append(record)

df_top10 = pd.DataFrame(top10_data)
df_top10.to_csv(os.path.join(output_path, "top10_trials_metrics.csv"), index=False, encoding="utf-8-sig")

# ✅ 绘制特征重要性图（基于最佳模型）
model_best = LGBMClassifier(**best_params, learning_rate=0.05, n_estimators=1000)
model_best.fit(X_sample, y_sample)
importances = model_best.feature_importances_
feat_names = X_sample.columns

plt.figure(figsize=(10, 6))
plt.barh(feat_names, importances)
plt.title("Feature Importances")
plt.xlabel("Importance")
plt.tight_layout()
plt.savefig(os.path.join(output_path, "feature_importance.png"))
plt.close()

# ✅ 绘制超参数重要性图
optuna.visualization.matplotlib.plot_param_importances(study)
plt.tight_layout()
plt.savefig(os.path.join(output_path, "hyperparameter_importance.png"))
plt.close()

# ✅ 绘制每个参数 vs F1-score / Recall 的散点图
params_to_plot = ["threshold", "scale_pos_weight", "num_leaves", "max_depth",
                  "subsample", "colsample_bytree", "min_child_samples",
                  "min_child_weight", "reg_alpha", "reg_lambda"]

df_trials = pd.DataFrame([{**t.params, **t.user_attrs} for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE])

for param in params_to_plot:
    if param not in df_trials.columns:
        continue

    plt.figure(figsize=(8, 5))
    plt.scatter(df_trials[param], df_trials["f1"], label="F1-score", alpha=0.7)
    plt.scatter(df_trials[param], df_trials["recall"], label="Recall", alpha=0.7)
    plt.title(f"{param} vs F1-score & Recall")
    plt.xlabel(param)
    plt.ylabel("Score")
    plt.legend()
    plt.grid()
    plt.tight_layout()
    plt.savefig(os.path.join(output_path, f"{param}_vs_f1_recall.png"))
    plt.close()

print(f"✅ Optuna调参完成！结果保存至: {output_path}")

# ✅ 生成 Optuna 参数交互图（Contour、Slice、Parallel）
import optuna.visualization as vis

# 创建用于存储交互图的子目录
timestamp_interaction = datetime.now().strftime("%Y%m%d_%H%M%S")
interaction_path = os.path.join(output_base_path, f"optuna_interactions_{timestamp_interaction}")
os.makedirs(interaction_path, exist_ok=True)

# ✅ 生成轮廓图（展示参数交互）
param_pairs = [
    ("threshold", "scale_pos_weight"),
    ("subsample", "colsample_bytree"),
    ("min_child_samples", "min_child_weight"),
    ("max_depth", "num_leaves"),
    ("reg_alpha", "reg_lambda")
]

for x, y in param_pairs:
    fig = vis.plot_contour(study, params=[x, y])
    fig.write_image(os.path.join(interaction_path, f"contour_{x}_vs_{y}.png"))

# ✅ 平行坐标图
fig = vis.plot_parallel_coordinate(study)
fig.write_image(os.path.join(interaction_path, "parallel_coordinate.png"))

# ✅ 切片图
fig = vis.plot_slice(study)
fig.write_image(os.path.join(interaction_path, "slice_plot.png"))

# ✅ 参数重要性图（备份）
fig = vis.plot_param_importances(study)
fig.write_image(os.path.join(interaction_path, "hyperparameter_importance.png"))

print(f"✅ 参数交互图生成完成，保存至: {interaction_path}")

# ✅ 绘制 Optimization History Plot 并保存（F1-score）
import optuna.visualization as vis  # 用 Plotly 版
# 先生成 Plotly Figure
fig1 = vis.plot_optimization_history(study)
# 写文件到磁盘
fig1.write_image(os.path.join(output_path, "optimization_history_f1.png"))

# ✅ 绘制 Optimization History Plot 并保存（Recall）
# 对于 recall，我们自己组织一下数据，然后用 matplotlib 画
import matplotlib.pyplot as plt

recalls = [t.user_attrs["recall"] for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE]
trials = [t.number for t in study.trials if t.state == optuna.trial.TrialState.COMPLETE]

plt.figure(figsize=(8, 5))
plt.plot(trials, recalls, marker='o', linestyle='-', color='tab:red', label='Recall')
plt.title("Optuna Optimization History (Recall)")
plt.xlabel("Trial Number")
plt.ylabel("Recall")
plt.grid(True)
plt.tight_layout()
plt.savefig(os.path.join(output_path, "optimization_history_recall.png"))
plt.close()

print("✅ 最佳值历史图（F1-score & Recall）已保存")



"""