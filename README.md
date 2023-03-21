# Website Scanner



## Setting up the scanner (Ubuntu 22.04)

Run the following commands in order

```
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash && sudo apt-get install -y nodejs
```

```
sudo apt update && sudo apt install -y gconf-service libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 libgbm-dev ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

```
echo "NODE_ENV=production" > .env
echo "PORT=3000" >> .env
echo "COOKIE_SECRET=$SECRET_KEY" >> .env
echo "JWT_SECRET=$SECRET_KEY" >> .env
echo "ADMIN_USERNAME=$LOGIN_USERNAME" >> .env
echo "ADMIN_PASSWORD=$LOGIN_PASSWORD" >> .env
echo "OUTREACH_DEFAULT_OWNER=$OUTREACH_DEFAULT_OWNER" >> .env
```

```
mkdir output
```

```
npm i -g pm2
```

```
pm2 start index.js
```

## Deploying the sccanner
