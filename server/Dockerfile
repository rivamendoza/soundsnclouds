##### Dockerfile to build server #####

FROM node:alpine

# set working directory
WORKDIR /src

# set working directory
COPY . package*.json ./

# install node modules
RUN npm install

# expose port 9000
EXPOSE 9000

# run node
CMD ["npm", "start"]