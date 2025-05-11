const COST_ESTIMATION_BASE_URL = 'http://localhost:5001';
const WORKER_SAFETY_BASE_URL = 'http://localhost:5000';

export const costEstimationAPI = {
    test: async () => {
        const response = await fetch(`${COST_ESTIMATION_BASE_URL}/test`);
        return await response.json();
    },

    predictStage: async (data) => {
        const response = await fetch(`${COST_ESTIMATION_BASE_URL}/api/predict/stage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // Building-based prediction
    predictBuilding: async (data) => {
        const response = await fetch(`${COST_ESTIMATION_BASE_URL}/api/predict/building`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // Random Forest prediction
    predictRF: async (data) => {
        const response = await fetch(`${COST_ESTIMATION_BASE_URL}/api/predict/rf`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },

    // Combined prediction (all models)
    predictAll: async (data) => {
        const response = await fetch(`${COST_ESTIMATION_BASE_URL}/api/predict/all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    }
};

export const workerSafetyAPI = {
    test: async () => {
        const response = await fetch(`${WORKER_SAFETY_BASE_URL}/test`);
        return await response.json();
    },

    processMedia: async (files) => {
        console.log("processMedia called with files:", files);
        const formData = new FormData();
        if (Array.isArray(files)) {
            files.forEach(file => formData.append('files', file));
        } else {
            formData.append('files', files);
        }

        console.log("worker safety formData:", Array.from(formData.entries()));
        try {
            const response = await fetch(`${WORKER_SAFETY_BASE_URL}/process-media`, {
                method: 'POST',
                body: formData
            });
            console.log("worker safety Response status:", response.status);
            const data = await response.json();
            console.log("worker safety Response data:", data);
            return data;
        } catch (error) {
            console.error("Error in processMedia:", error);
            throw error;
        }
    },

    getProcessedMedia: async (filename) => {
        const response = await fetch(`${WORKER_SAFETY_BASE_URL}/get-processed-media/${filename}`);
        return await response.blob();
    }
};
