# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container to /app
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source and the SDK key into /app/src/
COPY src/ ./src/
COPY tripwise-sdk-key.json ./src/

# Change the working directory to /app/src
WORKDIR /app/src

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Run app.py when the container launches
CMD ["python", "app.py"]
