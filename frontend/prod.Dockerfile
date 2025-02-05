FROM node:18-alpine as builder

WORKDIR /frontend

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build