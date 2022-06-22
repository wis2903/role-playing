# build environment
FROM node:16-alpine as build
WORKDIR /app
# Copying source files
COPY ./package.json ./
RUN yarn

ARG ENV

COPY . .

RUN yarn build
# Stage 1, based on Nginx, to have only the compiled app, ready for staging with Nginx
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# new
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
