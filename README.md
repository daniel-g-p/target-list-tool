# Website Scanner

## Setting up the scanner on Windows

Prerequsites: Install NodeJS from https://nodejs.org/en/download

1. Download files

2. Create folder "output"

3. Create file ".env" and paste and adapt the code found below (all items prefixed with a "$" sign should be customized)

```
NODE_ENV=production
PORT=3000
COOKIE_SECRET=$SECRET_KEY
JWT_SECRET=$SECRET_KEY
ADMIN_USERNAME=$LOGIN_USERNAME
ADMIN_PASSWORD=$LOGIN_PASSWORD
OUTREACH_DEFAULT_OWNER=$OUTREACH_DEFAULT_OWNER
```

4. Open the folder in the command line

5. Run "npm install"

6. Run "node index.js"

7. Open http://localhost:3000 in the browser
