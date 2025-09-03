FROM nginx:alpine

RUN rm /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Create custom error pages with CORS headers
RUN mkdir -p /usr/share/nginx/html/errors
RUN echo '{"error":"Service temporarily unavailable"}' > /usr/share/nginx/html/errors/502.json

EXPOSE 80