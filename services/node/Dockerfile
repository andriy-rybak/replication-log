FROM node:14.18.1-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY ./src ./src
CMD [ "npm", "start" ]