##### Dockerfile to build client #####

FROM node:alpine

# set working directory
WORKDIR /src

# use package.json script configurations 
COPY . package*.json ./

# install node modules
RUN npm install
# COPY . .

# expose port 3000
EXPOSE 3000

# start react script
CMD ["npm", "start"]