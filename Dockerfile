FROM node:18-buster
USER root
ENV TZ=Asia/Shanghai
RUN mkdir -p /home/app/
COPY ./ /home/app/analytics-consumer/
RUN ls -la /home/app/analytics-consumer/*
WORKDIR /home/app/analytics-consumer/
EXPOSE 8082
RUN npm install
RUN npm run build
CMD ["node", "dist/main"]