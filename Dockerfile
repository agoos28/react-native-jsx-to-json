FROM node

# Create app directory
RUN mkdir -p /app
WORKDIR /app

# Install Node.js 10
curl -sL https://deb.nodesource.com/setup_10.x | bash -
apt-get install -y nodejs

# Install yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
apt-get update && apt-get install yarn

# Install app dependencies
COPY package.json /app
COPY yarn.lock /app
RUN yarn

# Bundle app source
COPY . /app
RUN yarn build

EXPOSE 2000
CMD [ "yarn", "start" ]
