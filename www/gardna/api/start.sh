cd /var/www/html/gardna/api/ 
npm install --save
npm audit fix -f
npm update
#forever -c 'node --trace-warnings' /var/www/html/gardna/api/server.js (debug)
forever -c 'node --no-warnings' /var/www/html/gardna/api/server.js
