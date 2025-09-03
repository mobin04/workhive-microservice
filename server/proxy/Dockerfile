FROM nginx:alpine

RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# index.html to handle root requests
RUN echo "Workhive Proxy Service" > /usr/share/nginx/html/index.html

EXPOSE 80