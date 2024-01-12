# Use an official Node.js runtime as a base image
FROM node:latest

# Update OS mostly for enjoy latest security updates
RUN apt-get update && apt-get upgrade -y

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the rest of the application code to the working directory
COPY --chown=node:node ../../. .

# update npm package manager if required
RUN npm install -g npm

# Copy the startup script to the container
COPY --chown=node:node startup-script.sh /usr/src/app/startup-script.sh

# Give execute permissions to the script
RUN chmod +x /usr/src/app/startup-script.sh

# set user to node
USER node

# Expose the port your app runs on
EXPOSE 3000

# Define the command with a fallback value
CMD ["sh","/usr/src/app/startup-script.sh"]