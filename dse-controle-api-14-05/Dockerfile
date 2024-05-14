FROM node:16.19

ENV TZ="America/Sao_Paulo"

RUN mkdir -p /opt/dse-controle-api

WORKDIR /opt/dse-controle-api

COPY package*.json ./

RUN npm i

RUN npm i forever -g

COPY . .

EXPOSE 1100

CMD ["forever", "server.js"]

