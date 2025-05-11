# src/predict_manual.py

import joblib
import pandas as pd

# Load trained models
material_model = joblib.load("../models/material_model.pkl")
timecost_model = joblib.load("../models/time_cost_model.pkl")

# Input values (NO encoding here)
input_data = {
    "area_sqft": 2500,
    "floors": 2,
    "building_type": "residential",      # Must match training values
    "structure_type": "RCC",
    "wall_material": "brick",
    "construction_stage": "superstructure"
}

# Create DataFrame
df_input = pd.DataFrame([input_data])

# Send raw input to model (pipeline handles preprocessing)
material_preds = material_model.predict(df_input)[0]
timecost_preds = timecost_model.predict(df_input)[0]

# Show results
print("\n🧱 Material Estimate:")
print(f"Cement Bags: {material_preds[0]:.2f}")
print(f"Sand (m³): {material_preds[1]:.2f}")
print(f"Steel (kg): {material_preds[2]:.2f}")
print(f"Bricks (units): {material_preds[3]:.2f}")
print(f"Aggregates (m³): {material_preds[4]:.2f}")

print("\n🕒 Time & Cost Estimate:")
print(f"Estimated Days: {timecost_preds[0]:.0f}")
print(f"Estimated Cost (INR): ₹{timecost_preds[1]:,.2f}")
