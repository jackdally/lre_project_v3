# Use an official lightweight Python image.
FROM python:3.9-slim

# Set environment variables to prevent Python buffering and write .pyc files.
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory in the container.
WORKDIR /app

# Copy requirements.txt into the container.
# Create a requirements.txt file listing your dependencies, e.g.:
# fastapi
# uvicorn
# sqlalchemy
# pydantic
# psycopg2-binary  (if you use PostgreSQL later)
COPY requirements.txt .

# Install the Python dependencies.
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the rest of your project code.
COPY . .

# Expose the port that your app runs on.
EXPOSE 8000

# Command to run your app with uvicorn.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
