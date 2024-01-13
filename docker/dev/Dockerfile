# Use an official Node.js runtime as a base image
FROM node:latest

# Update OS mostly to enjoy latest security updates
RUN apt-get update && apt-get upgrade -y

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the rest of the application code to the working directory
COPY --chown=node:node ../../. .

# update npm package manager if required
RUN npm install -g npm

# Copy the startup script to the container
COPY --chown=node:node app-startup.sh /usr/src/app/app-startup.sh

# Give execute permissions to the script
RUN chmod +x /usr/src/app/app-startup.sh

# set user to node
USER node

# Expose the port your app runs on
EXPOSE 3000

# Define the startup command
CMD ["sh","/usr/src/app/app-startup.sh"]