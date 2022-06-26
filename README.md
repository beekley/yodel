# yodel

## Installation

### Firebase

This project uses Firebase for deployment. To deploy your own instance:

1. Follow the [Firebase Web getting started](https://firebase.google.com/docs/web/setup) guide to create a project and install the CLI.
1. Run `firebase deploy`.

### Platform-agnostic

Alternatively, this project can run as a standalone web server. To run this:

1. Install Node >=16.
1. Build and serve:

```
cd src
npm install
npm run dev:build
npm run dev:serve

# In a new terminal.
cd ../client
npm install
npm run build # run this every time you change client code.
```