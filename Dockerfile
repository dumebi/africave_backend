FROM node:latest
WORKDIR '/app'
COPY ./package.json ./
RUN npm install -g jest
RUN npm install

COPY . .
CMD ["npm", "run", "dev"]