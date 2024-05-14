# FROM node:14.17.3

# RUN mkdir -p /opt/dse-novo-portal

# WORKDIR /opt/dse-novo-portal

# ENV PATH /opt/dse-novo-portal/node_modules/.bin:$PATH

# COPY package*.json ./

# RUN npm i

# # RUN npm install react-scripts@4.0.3 -g

# COPY . .

# EXPOSE 3000

# CMD ["npm", "start"]


FROM node:14.17.3 as build
WORKDIR '/app'
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json
# COPY package-lock.json /app/package-lock.json
RUN npm install
COPY . /app
RUN npm run build
# production environment
FROM nginx:1.16.0-alpine
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
