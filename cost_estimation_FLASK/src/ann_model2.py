import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout, Input
from tensorflow.keras.optimizers import Adam


# --- Load and preprocess dataset ---
df = pd.read_csv("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/data/construction_dataset_with_stage.csv")

# Convert StartDate and EndDate to datetime
df['StartDate'] = pd.to_datetime(df['StartDate'], dayfirst=True)
df['EndDate'] = pd.to_datetime(df['EndDate'], dayfirst=True)

# Create TotalDays from StartDate and EndDate
df['TotalDays'] = (df['EndDate'] - df['StartDate']).dt.days

# Drop raw date columns
df.drop(columns=['StartDate', 'EndDate'], inplace=True)

# Handle categorical variables
df = pd.get_dummies(df, drop_first=True)

# Drop rows with missing values
df.dropna(inplace=True)

# Features and targets (exclude NumWorkers completely)
X = df.drop(columns=['TotalDays', 'ConstructionCost'])
y_days = df['TotalDays']
y_cost = df['ConstructionCost']

# Train-test splits
X_train, X_test, y_days_train, y_days_test = train_test_split(X, y_days, test_size=0.2, random_state=42)
_, _, y_cost_train, y_cost_test = train_test_split(X, y_cost, test_size=0.2, random_state=42)

# Feature scaling
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# --- Model architecture helper ---
def build_model():
    model = Sequential([
        Dense(128, activation='relu', input_shape=(X_train_scaled.shape[1],)),
        Dropout(0.3),
        Dense(64, activation='relu'),
        Dropout(0.2),
        Dense(1, activation='linear')
    ])
    model.compile(optimizer=Adam(0.001), loss='mse')
    return model

# --- Model 1: Total Days ---
model_days = build_model()
model_days.fit(X_train_scaled, y_days_train, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

# --- Model 2: Total Cost ---
model_cost = build_model()
model_cost.fit(X_train_scaled, y_cost_train, epochs=100, batch_size=32, validation_split=0.2, verbose=0)

# --- Evaluation helper ---
def evaluate_model(y_true, y_pred, label):
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    print(f"{label} - RMSE: {rmse:.2f}, R²: {r2:.4f}")

# --- Evaluate both models ---
evaluate_model(y_days_test, model_days.predict(X_test_scaled), "TotalDays")
evaluate_model(y_cost_test, model_cost.predict(X_test_scaled), "ConstructionCost")

# --- Save models ---
model_days.save("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/building_time.h5")
model_cost.save("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/building_cost.h5")
