# src/train_models.py
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Load data
# Absolute path (example — update based on where your file is)
df = pd.read_csv("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/data/construction_data.csv")


# Define inputs and targets
features = ['area_sqft', 'floors', 'building_type', 'structure_type', 'wall_material', 'construction_stage']
material_targets = ['cement_bags', 'sand_cubic_meters', 'steel_kg', 'bricks_units', 'aggregates_cubic_meters']
time_cost_targets = ['estimated_days', 'estimated_cost_inr']

X = df[features]
y_materials = df[material_targets]
y_time_cost = df[time_cost_targets]

# Categorical columns
categorical_cols = ['building_type', 'structure_type', 'wall_material', 'construction_stage']

# Preprocessing
preprocessor = ColumnTransformer([
    ("onehot", OneHotEncoder(handle_unknown="ignore"), categorical_cols)
], remainder='passthrough')

# Pipelines
material_model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42)))
])

time_cost_model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", MultiOutputRegressor(RandomForestRegressor(n_estimators=100, random_state=42)))
])

# Train/test split
X_train_m, X_test_m, y_train_m, y_test_m = train_test_split(X, y_materials, test_size=0.2, random_state=42)
X_train_tc, X_test_tc, y_train_tc, y_test_tc = train_test_split(X, y_time_cost, test_size=0.2, random_state=42)

# Fit models
material_model.fit(X_train_m, y_train_m)
time_cost_model.fit(X_train_tc, y_train_tc)

# Save models
joblib.dump(material_model, "C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/material_model.pkl")
joblib.dump(time_cost_model, "C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/time_cost_model.pkl")

# Evaluate
y_pred_m = material_model.predict(X_test_m)
y_pred_tc = time_cost_model.predict(X_test_tc)

print("Material Model Evaluation:")
print("MSE:", mean_squared_error(y_test_m, y_pred_m, multioutput='raw_values'))
print("R²:", r2_score(y_test_m, y_pred_m, multioutput='raw_values'))

print("\nTime & Cost Model Evaluation:")
print("MSE:", mean_squared_error(y_test_tc, y_pred_tc, multioutput='raw_values'))
print("R²:", r2_score(y_test_tc, y_pred_tc, multioutput='raw_values'))

# Save training feature columns
joblib.dump(X.columns.tolist(), "../models/columns.pkl")
