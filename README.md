# EDAI - Construction Project Management System

A comprehensive construction project management system that combines cost estimation and worker safety monitoring capabilities.

## Features

### 1. Cost Estimation System
- Neural network-based cost prediction for construction projects
- Stage-based and building-based cost estimation
- Material requirements prediction
- Time estimation for construction stages
- Cost estimation in INR

### 2. Worker Safety Monitoring System
- Real-time PPE (Personal Protective Equipment) detection
- Support for both images and video processing
- Detection of safety gear including:
  - Safety Helmets
  - Safety Vests
  - Safety Gloves
  - Safety Glasses
- Real-time alerts for missing safety equipment
- Video processing with frame-by-frame analysis

## System Architecture

The system consists of two main components:

1. **Cost Estimation API** (Port 5001)
   - Flask-based REST API
   - Neural network models for predictions
   - Standardized data preprocessing

2. **Worker Safety API** (Port 5000)
   - Flask-based REST API
   - YOLO-based object detection
   - Support for image and video processing
   - Real-time safety gear detection

## Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Git

## Installation

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd EDAI
```

2. Set up Python virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Download required models:
- Place YOLO models in the worker_safety_model directory
- Place cost estimation models in the cost_estimation_FLASK/models directory

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
REACT_APP_COST_API_URL=http://localhost:5001
REACT_APP_SAFETY_API_URL=http://localhost:5000
```

## Running the Application

### Backend Services

1. Start the Cost Estimation API:
```bash
cd cost_estimation_FLASK/src
python app.py
```

2. Start the Worker Safety API:
```bash
cd worker_safety_model
python app.py
```

### Frontend Development

```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Endpoints

### Cost Estimation API (Port 5001)

- `GET /test` - Health check endpoint
- `POST /api/predict/stage` - Stage-based predictions
- `POST /api/predict/building` - Building-based predictions
- `POST /api/predict/all` - Combined predictions

### Worker Safety API (Port 5000)

- `GET /test` - Health check endpoint
- `GET /health` - Detailed health status
- `POST /process-media` - Process images/videos
- `GET /get-processed-media/<filename>` - Retrieve processed media

## Frontend Structure

```
Frontend/
├── src/
│   ├── Components/
│   │   ├── CostEstimation/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── Pages/
│   │   ├── HomePage.jsx
│   │   ├── AboutInputs.jsx
│   │   ├── PredictionForm.jsx
│   │   ├── EstimatedResult.jsx
│   │   └── Routes.js
│   ├── App.css
│   ├── App.jsx
│   └── index.js
├── public/
├── node_modules/
├── package.json
├── package-lock.json
├── tailwind.config.js
├── README.md
└── .gitignore
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, please open an issue in the GitHub repository or contact the development team.
