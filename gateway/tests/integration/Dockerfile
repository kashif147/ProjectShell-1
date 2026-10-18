# TEST-ONLY gateway image: the same OpenResty and Lua packages as the DEV gateway image
# (openresty 1.25.3.1 on Ubuntu focal; lua-resty-jwt 0.1.11, lua-resty-hmac 0.06,
# lua-resty-string 0.11, lua-resty-http 0.17.1). The tracked nginx.conf, sites-enabled/ and lua/
# are mounted read-only at run time by gateway.integration.test.js. Never deployed.
FROM openresty/openresty:1.25.3.1-focal

RUN opm get SkyLothar/lua-resty-jwt=0.1.11 ledgetech/lua-resty-http=0.17.1 \
 && apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /var/cache/nginx /etc/nginx/conf.d /etc/nginx/lua \
 && mkdir -p /etc/letsencrypt/live/projectshell-vm.northeurope.cloudapp.azure.com \
 && openssl req -x509 -newkey rsa:2048 -nodes -days 2 -subj "/CN=gateway-test" \
      -keyout /etc/letsencrypt/live/projectshell-vm.northeurope.cloudapp.azure.com/privkey.pem \
      -out /etc/letsencrypt/live/projectshell-vm.northeurope.cloudapp.azure.com/fullchain.pem \
 && printf "it:%s\n" "$(openssl passwd -apr1 it)" > /etc/nginx/n8n.htpasswd  # test-only Basic auth for /n8n/

CMD ["openresty", "-g", "daemon off;"]
