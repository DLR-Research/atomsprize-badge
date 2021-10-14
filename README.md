## Development
* `yarn dev:mac_os` will serve badge renders to `http://localhost:3000/:campaign_id/:user_id.png`
using the default Chrome path on MacOS. For other paths run `env CHROME_PATH=<path_to_chrome> nodemon local.js`
* `yarn format` with prettify the source files

## Deploy
We deploy to a lambda of architecture amd64
### Build node_modules
SSH into EC2 instance of architecture amd64 and do:
1. Clone and `cd` into this repository
2. `rm -rf node_modules`
3. `npm install --only=prod`
4. `zip -r index index.js render.js node_modules` (make sure there isn't any extra stuff in node_modules

Now back on your local machine:
1. `scp` the `.zip` that was just created locally
2. Upload the `.zip` to the Lambda web interface
3. (optional) extract the `.zip` locally so you can reuse `node_modules` and skip the EC2 step until `package.json` changes
