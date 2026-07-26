FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for XGBoost
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/app/ ./app/
COPY backend/train_models.py .

# Copy dataset for model training
COPY behavior_anomaly_training_dataset.xlsx ./data/dataset.xlsx

# Create saved_models directory
RUN mkdir -p saved_models

# Set environment variable for model directory
ENV MODEL_DIR=/app/saved_models

# Train models during build
RUN python train_models.py --data-path ./data/dataset.xlsx

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
