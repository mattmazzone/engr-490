# Use an official Python runtime as a parent image
FROM python:3.9-slim

# Set the working directory in the container to /app
WORKDIR /app

# Copy the requirements file and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application source into /app/src/
COPY src/ ./src/

# Copy the SDK key file into the /app/ directory
COPY tripwise-sdk-key.json ./

# Change the working directory to /app/src
WORKDIR /app/src

# Make port 4000 available to the world outside this container
EXPOSE 4000

# Use Gunicorn to serve the Flask application
CMD ["gunicorn", "-b", "0.0.0.0:4000", "app:app"]

