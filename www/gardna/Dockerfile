FROM node:16.14
USER root
RUN mkdir -p /var/www/html/gardna/node_modules && chown -R root /var/www/html/gardna
WORKDIR /var/www/html/gardna
RUN apt-get upgrade && apt-get update && apt-get install -y &&  npm install forever -gf && npm install nodemon -gf
RUN export NODE_OPTIONS=--max-old-space-size=8192
RUN export NODE_NO_WARNINGS=1
COPY . .
COPY --chown=root:root . .
EXPOSE 8081
RUN echo "America/Sao_Paulo" > /etc/timezone
RUN dpkg-reconfigure -f noninteractive tzdata
CMD nohup sh /var/www/html/gardna/api/start.sh & sleep infinity