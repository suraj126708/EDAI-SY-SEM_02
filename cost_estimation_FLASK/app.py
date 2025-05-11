from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from tensorflow.keras.models import load_model
from sklearn.preprocessing import StandardScaler
import os

app = Flask(__name__)
CORS(app)  

print("hello")

# Define base directories - adjust these paths as needed
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) 
MODEL_DIR = os.path.join(BASE_DIR, "models")
DATA_DIR = os.path.join(BASE_DIR, "data")

# Global variables to store models and data
model_materials_stage = None
model_days_stage = None
model_cost_stage = None
model_days_building = None
model_cost_building = None
scaler_stage = None
scaler_building = None
X_cols_stage = None
X_cols_building = None

def load_models_and_data():
    global model_materials_stage, model_days_stage, model_cost_stage
    global model_days_building, model_cost_building
    global scaler_stage, scaler_building
    global X_cols_stage, X_cols_building
    
    # Load neural network models
    model_materials_stage = load_model(os.path.join(MODEL_DIR, 'stage_material.h5'), compile=False)
    model_days_stage = load_model(os.path.join(MODEL_DIR, 'stage_time.h5'), compile=False)
    model_cost_stage = load_model(os.path.join(MODEL_DIR, 'stage_cost.h5'), compile=False)
    
    model_days_building = load_model(os.path.join(MODEL_DIR, 'building_time.h5'), compile=False)
    model_cost_building = load_model(os.path.join(MODEL_DIR, 'building_cost.h5'), compile=False)
    
    # Load and prepare scalers and columns for neural network models
    # For stage models
    df_stage = pd.read_csv(os.path.join(DATA_DIR, 'construction_data.csv'))
    features_stage = df_stage.drop(columns=[
        'cement_bags', 'sand_cubic_meters', 'steel_kg', 'bricks_units',
        'aggregates_cubic_meters', 'estimated_days', 'estimated_cost_inr'
    ])
    X_full_stage = pd.get_dummies(features_stage, drop_first=True)
    X_cols_stage = X_full_stage.columns
    
    scaler_stage = StandardScaler()
    scaler_stage.fit(X_full_stage)
    
    # For building models
    df_building = pd.read_csv(os.path.join(DATA_DIR, 'construction_dataset_with_stage.csv'))
    df_building['StartDate'] = pd.to_datetime(df_building['StartDate'], dayfirst=True)
    df_building['EndDate'] = pd.to_datetime(df_building['EndDate'], dayfirst=True)
    df_building['TotalDays'] = (df_building['EndDate'] - df_building['StartDate']).dt.days
    df_building.drop(columns=['StartDate', 'EndDate'], inplace=True)
    X_building = df_building.drop(columns=['TotalDays', 'ConstructionCost'])
    X_full_building = pd.get_dummies(X_building, drop_first=True)
    X_cols_building = X_full_building.columns
    
    scaler_building = StandardScaler()
    scaler_building.fit(X_full_building)

# Initialize models and data
load_models_and_data()

# Health check endpoint
@app.route('/test', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "API is running"})

# Stage-based prediction endpoint (Neural Network)
@app.route('/api/predict/stage', methods=['POST'])
def predict_stage():
    try:
        data = request.json
        
        sample_df = pd.DataFrame([data])
        
        # Encode categorical features
        sample_encoded = pd.get_dummies(sample_df, drop_first=True)
        
        # Align with training columns
        sample_encoded = sample_encoded.reindex(columns=X_cols_stage, fill_value=0)
        
        # Scale input
        sample_scaled = scaler_stage.transform(sample_encoded)
        
        # Make predictions
        materials_pred = model_materials_stage.predict(sample_scaled)[0]
        days_pred = model_days_stage.predict(sample_scaled)[0][0]
        cost_pred = model_cost_stage.predict(sample_scaled)[0][0]
        
        # Format response
        response = {
            "materials": {
                "cement_bags": float(materials_pred[0]),
                "sand_cubic_meters": float(materials_pred[1]),
                "steel_kg": float(materials_pred[2]),
                "bricks_units": float(materials_pred[3]),
                "aggregates_cubic_meters": float(materials_pred[4])
            },
            "estimated_stage_days": float(days_pred),
            "estimated_stage_cost_inr": float(cost_pred)
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Building-based prediction endpoint (Neural Network)
@app.route('/api/predict/building', methods=['POST'])
def predict_building():
    try:
        data = request.json
        
        # Create DataFrame
        sample_df = pd.DataFrame([data])
        
        # Encode categorical features
        sample_encoded = pd.get_dummies(sample_df, drop_first=True)
        
        # Align with training columns
        sample_encoded = sample_encoded.reindex(columns=X_cols_building, fill_value=0)
        
        # Scale input
        sample_scaled = scaler_building.transform(sample_encoded)
        
        # Make predictions
        predicted_days = model_days_building.predict(sample_scaled)[0][0]
        predicted_cost = model_cost_building.predict(sample_scaled)[0][0]
        
        # Format response
        response = {
            "estimated_days": float(predicted_days),
            "estimated_cost_inr": float(predicted_cost)
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# Combined prediction endpoint - returns results from all models
@app.route('/api/predict/all', methods=['POST'])
def predict_all():
    try:
        data = request.json
        
        # Create common DataFrame
        sample_df = pd.DataFrame([data])
        
        # Prepare data for stage model
        sample_encoded_stage = pd.get_dummies(sample_df, drop_first=True)
        sample_encoded_stage = sample_encoded_stage.reindex(columns=X_cols_stage, fill_value=0)
        sample_scaled_stage = scaler_stage.transform(sample_encoded_stage)
        
        # Prepare data for building model if applicable
        building_prediction = None
        try:
            sample_encoded_building = pd.get_dummies(sample_df, drop_first=True)
            sample_encoded_building = sample_encoded_building.reindex(columns=X_cols_building, fill_value=0)
            sample_scaled_building = scaler_building.transform(sample_encoded_building)
            
            # Building model predictions
            predicted_days_building = model_days_building.predict(sample_scaled_building)[0][0]
            predicted_cost_building = model_cost_building.predict(sample_scaled_building)[0][0]
            
            building_prediction = {
                "estimated_days": float(predicted_days_building),
                "estimated_cost_inr": float(predicted_cost_building)
            }
        except:
            pass
        
        # Stage model predictions
        materials_pred = model_materials_stage.predict(sample_scaled_stage)[0]
        days_pred = model_days_stage.predict(sample_scaled_stage)[0][0]
        cost_pred = model_cost_stage.predict(sample_scaled_stage)[0][0]
        
        # Combine results
        response = {
            "stage_model": {
                "materials": {
                    "cement_bags": float(materials_pred[0]),
                    "sand_cubic_meters": float(materials_pred[1]),
                    "steel_kg": float(materials_pred[2]),
                    "bricks_units": float(materials_pred[3]),
                    "aggregates_cubic_meters": float(materials_pred[4])
                },
                "estimated_stage_days": float(days_pred),
                "estimated_stage_cost_inr": float(cost_pred)
            }
        }
        
        if building_prediction:
            response["building_model"] = building_prediction
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(debug=True, host='0.0.0.0', port=port)