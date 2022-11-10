# Blog Deployment Wizard dApp

Welcome to the Blog Deployment Wizard dApp. This README is a basic guide to getting started with this application.

This is a React JS app. So you will need to install dependencies for it and run a build watcher if you want to develop it further.

## Main Libraries

This dApp uses:

* [React JS](https://reactjs.org/) **v 17.x**
* [React Bootstrap](https://react-bootstrap.github.io/) **v 2.x**
* [Bootstrap](https://getbootstrap.com/) **v 5.x**

## Deploy the site to mainnet using Point Node

### Build the dApp 

Since this a React JS site it rquires to be built before it can be deployed as follows:

```
npm i
npm run build
```

Now a `public` folder will be created containing the deployable built site. 

### Clone the Point Network repo, install dependencies and start the node (connecting to mainnet)

Note that when you start the node it will use your key file found in your local point directory: `~/.point/keystore/key.json`. If you do not have this file then the node will not start. To create this file simply install [Point Network Alpha](https://pointnetwork.io/alpha). 

```
git clone git@github.com:pointnetwork/pointnetwork.git
cd pointnetwork
nvm use
npm i
npm run start
```

### Run the Point Deployer CLI

Note this command is run from the `pointnetwork` cloned repo (see above and assumes the dApp is one level below the directoy where the command is run.

```
cd pointnetwork
./point deploy ../blog.point
``