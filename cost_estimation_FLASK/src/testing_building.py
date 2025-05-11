import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler

# --- Load dataset to refit scaler and columns ---
df = pd.read_csv("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/data/construction_dataset_with_stage.csv")

# Define features (exclude targets)
X_raw = df.copy()


# One-hot encode categorical features
X_full = pd.get_dummies(X_raw, drop_first=True)

# Fit scaler
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_full)

# --- Load Trained Models ---
model_days = load_model('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/building_time.h5', compile=False)
model_cost = load_model('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/building_cost.h5', compile=False)

# --- Define Sample Input (same structure as X_raw) ---
sample_input = {
    'area_sqft': 4500,
    'floors': 2,
    'building_type': 'Commercial',
    'structure_type': 'RCC',
    'wall_material': 'Concrete Blocks',
    'construction_stage': 'Finishing',
    'location': 'Mumbai',
    'contractor_experience_years': 12,
    'labor_quality': 'High',
    'weather_condition': 'Good'
}

# Convert to DataFrame
sample_df = pd.DataFrame([sample_input])

# One-hot encode sample input
sample_encoded = pd.get_dummies(sample_df, drop_first=True)

# Align with training columns (fill missing with 0)
sample_encoded = sample_encoded.reindex(columns=X_full.columns, fill_value=0)

# Scale input
sample_scaled = scaler.transform(sample_encoded)

# --- Predict ---
predicted_days = model_days.predict(sample_scaled)[0][0]
predicted_cost = model_cost.predict(sample_scaled)[0][0]

# --- Output ---
print(f"\n🕒 Estimated Time to Completion: {predicted_days:.2f} days")
print(f"💰 Estimated Cost: ₹{predicted_cost:,.2f}")
