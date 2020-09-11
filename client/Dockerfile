# FROM node:erbium

# COPY . /src

# WORKDIR /src

# RUN npm install

# EXPOSE 3000

# CMD ["npm", "start"]

FROM node:8

WORKDIR /src
COPY . package*.json ./

RUN npm install
COPY . .

EXPOSE 3000

CMD ["npm", "start"]