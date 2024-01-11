# Get the latest official node.js container from docker hub
FROM node:latest
LABEL maintainer="handtrixxx <niklas.stephan@gmail.com>"

# install the latest uperating system updates
RUN apt-get update && apt-get upgrade -y

# Bring or project directory into the container
ADD . /nextjs-dashboard
WORKDIR /nextjs-dashboard
VOLUME /nextjs-dashboard

# install the used modules into the node_modules folder
RUN npm install

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm", "run", "dev"]
#ENTRYPOINT ["tail", "-f", "/dev/null"]
