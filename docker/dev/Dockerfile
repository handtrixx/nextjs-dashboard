# Use an official Node.js runtime as a base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the rest of the application code to the working directory
COPY ../../. .

RUN npm install -g npm

# Copy the startup script to the container
COPY startup-script.sh /usr/src/app/startup-script.sh

# Give execute permissions to the script
RUN chmod +x /usr/src/app/startup-script.sh

# Expose the port your app runs on
EXPOSE 3000

# Define the command with a fallback value
CMD ["sh","/usr/src/app/startup-script.sh"]