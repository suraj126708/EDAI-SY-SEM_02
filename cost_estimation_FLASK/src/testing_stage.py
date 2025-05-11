import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler

# --- Load the original dataset for fitting the scaler and encoding ---
df = pd.read_csv("C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/data/construction_data.csv")

# Keep a copy of full feature columns before training
full_features = df.drop(columns=[
    'cement_bags', 'sand_cubic_meters', 'steel_kg', 'bricks_units',
    'aggregates_cubic_meters', 'estimated_days', 'estimated_cost_inr'
])
X_full = pd.get_dummies(full_features, drop_first=True)

# Fit scaler on full training data
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_full)

# --- Load Models ---
model_materials = load_model('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/stage_material.h5', compile=False)
model_days = load_model('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/stage_time.h5', compile=False)
model_cost = load_model('C:/Users/devja/OneDrive/Documents/EDAI SEM 4/Construction_monitoring/models/stage_cost.h5', compile=False)

# --- Define a sample input (same structure as full_features) ---
sample_input = {
    'area_sqft': 4500,
    'floors': 2,
    'building_type': 'Commercial',
    'structure_type': 'RCC',
    'wall_material': 'Concrete Blocks',
    'construction_stage': 'Excavation'
}

# Convert to DataFrame
sample_df = pd.DataFrame([sample_input])

# Match encoding with training data
sample_encoded = pd.get_dummies(sample_df, drop_first=True)

# Align with X_full columns (to handle missing columns)
sample_encoded = sample_encoded.reindex(columns=X_full.columns, fill_value=0)

# Scale input
sample_scaled = scaler.transform(sample_encoded)

# --- Predictions ---
materials_pred = model_materials.predict(sample_scaled)[0]
days_pred = model_days.predict(sample_scaled)[0][0]
cost_pred = model_cost.predict(sample_scaled)[0][0]

# --- Display ---
print("\nPredicted Construction Material Requirements:")
print(f"  Cement Bags:         {materials_pred[0]:.2f}")
print(f"  Sand (m³):           {materials_pred[1]:.2f}")
print(f"  Steel (kg):          {materials_pred[2]:.2f}")
print(f"  Bricks (units):      {materials_pred[3]:.2f}")
print(f"  Aggregates (m³):     {materials_pred[4]:.2f}")

print(f"\nPredicted Estimated Time to Completion: {days_pred:.2f} days")
print(f"Predicted Estimated Cost: ₹{cost_pred:,.2f}")
