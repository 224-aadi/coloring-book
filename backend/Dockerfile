# Python OpenCV Line Art Converter
FROM python:3.11-slim

# Install system dependencies for OpenCV
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY main.py .

# Expose port (Render uses PORT env variable)
EXPOSE 8000

# Run the application - uses PORT env var if set, defaults to 8000
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
