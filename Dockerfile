# Use an official lightweight Python image
FROM python:3.9-slim

# Set environment variables to prevent Python buffering and write .pyc files.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container.
WORKDIR /app

# Copy and install dependencies separately for better Docker caching
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code.
COPY . .

# Expose the FastAPI port
EXPOSE 8000

# Command to run the FastAPI backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
