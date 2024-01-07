FROM node:latest
LABEL maintainer="handtrixxx <niklas.stephan@gmail.com>"

RUN apt-get update && apt-get upgrade -y

ADD . /nextjs-dashboard
VOLUME /nextjs-dashboard
WORKDIR /nextjs-dashboard

#COPY ./.env ./
RUN npm install
#RUN npm i sharp
#RUN npm run build

# Expose port 3000
EXPOSE 3000

# Run the app
#CMD ["npm", "run", "dev"]
ENTRYPOINT ["tail", "-f", "/dev/null"]


#@next/swc-darwin-arm64
#@next/swc-linux-arm64
