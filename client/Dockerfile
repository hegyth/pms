FROM node:20-alpine

ARG API_URL

ENV VITE_API_BASE_URL=$API_URL

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build --force

EXPOSE 5175

RUN npm i -g vite

CMD vite preview --port 5175 --host 0.0.0.0