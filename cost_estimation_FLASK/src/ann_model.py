import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.optimizers import Adam

# Load dataset
df = pd.read_csv("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/data/construction_data.csv")

# --- FEATURES ---
features = df.drop(columns=[
    'cement_bags', 'sand_cubic_meters', 'steel_kg', 'bricks_units',
    'aggregates_cubic_meters', 'estimated_days', 'estimated_cost_inr'
])

X = pd.get_dummies(features, drop_first=True)

# --- TARGET GROUPS ---
y_materials = df[['cement_bags', 'sand_cubic_meters', 'steel_kg', 'bricks_units', 'aggregates_cubic_meters']]
y_days = df['estimated_days']
y_cost = df['estimated_cost_inr']

# --- Train-test split ---
X_train, X_test, y_mat_train, y_mat_test = train_test_split(X, y_materials, test_size=0.2, random_state=42)
_, _, y_day_train, y_day_test = train_test_split(X, y_days, test_size=0.2, random_state=42)
_, _, y_cost_train, y_cost_test = train_test_split(X, y_cost, test_size=0.2, random_state=42)

# --- Scale input features ---
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# === Helper to build model ===
def build_model(output_dim):
    model = Sequential([
        Dense(128, activation='relu', input_shape=(X_train_scaled.shape[1],)),
        Dropout(0.2),
        Dense(64, activation='relu'),
        Dropout(0.2),
        Dense(output_dim, activation='linear')
    ])
    model.compile(optimizer=Adam(0.001), loss='mse')
    return model

# --- Model 1: Materials ---
model_materials = build_model(output_dim=5)
model_materials.fit(X_train_scaled, y_mat_train, epochs=50, batch_size=32, validation_split=0.2, verbose=1)

# --- Model 2: Estimated Days ---
model_days = build_model(output_dim=1)
model_days.fit(X_train_scaled, y_day_train, epochs=50, batch_size=32, validation_split=0.2, verbose=1)

# --- Model 3: Estimated Cost ---
model_cost = build_model(output_dim=1)
model_cost.fit(X_train_scaled, y_cost_train, epochs=50, batch_size=32, validation_split=0.2, verbose=1)

# --- Predictions & Evaluation ---
def evaluate_model(y_true, y_pred, label):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"{label} - RMSE: {rmse:.2f}, R2: {r2:.4f}")

evaluate_model(y_mat_test, model_materials.predict(X_test_scaled), "Materials")
evaluate_model(y_day_test, model_days.predict(X_test_scaled).flatten(), "Estimated Days")
evaluate_model(y_cost_test, model_cost.predict(X_test_scaled).flatten(), "Estimated Cost")

model_materials.save('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/stage_material.h5')
model_days.save('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/stage_time.h5')
model_cost.save('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/stage_cost.h5')

