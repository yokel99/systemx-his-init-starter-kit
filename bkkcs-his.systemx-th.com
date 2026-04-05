server {
    listen 80;
    server_name bkkcs-his.systemx-th.com;

    access_log /var/log/nginx/bkkcs-his.systemx-th.com.log log_format_00;
    error_log /var/log/nginx/bkkcs-his.systemx-th.com-error.log;

    location / {
        proxy_pass         http://127.0.0.1:9701;
        proxy_http_version 1.1;

        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $http_x_forwarded_proto;

        # SPA fallback ผ่าน nginx ใน container แล้ว ไม่ต้อง intercept errors
        proxy_read_timeout  60;
        proxy_send_timeout  60;
        proxy_connect_timeout 10;
    }
}
