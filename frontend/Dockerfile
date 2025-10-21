# This Dockerfile sets up a Node.js environment for a frontend application.
# It installs dependencies, builds the application, and exposes port 3000.


# \. "$HOME/.nvm/nvm.sh" to run yarn

FROM node:16
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install
RUN npm run build
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]
