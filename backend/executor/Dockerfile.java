FROM node:18-alpine

# Install Java (OpenJDK 17) and GNU time
RUN apk add --no-cache openjdk17 time

WORKDIR /app

COPY package.json .
RUN npm install

COPY src/ src/

EXPOSE 3000

CMD ["npm", "start"]
