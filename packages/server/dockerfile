FROM node:20.3

# set working directory
WORKDIR /app



# install app dependencies
COPY package.json ./

RUN npm install

############
FROM node:20.3-bullseye
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY --from=0 /app/. ./

# add app
COPY . ./

# compile typescript
RUN npm run build

# start app
CMD ["npm", "run", "start-server"]