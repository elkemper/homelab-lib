FROM node:16.13

# set working directory
WORKDIR /app



# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

############
FROM node:16.13-alpine
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY --from=0 /app/. ./

# add app
COPY . ./

# start app
CMD ["npm", "start"]