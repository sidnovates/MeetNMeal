# Use official lightweight Python image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside the container
WORKDIR /app

# Copy requirement file first to leverage Docker layer caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Expose port (Railway dynamically binds $PORT)
EXPOSE 8000

# Start Uvicorn server on fixed port 8000 to match Railway networking
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
