'use strict'
require('dotenv').config()

const loaders = require('./src/loaders/loaders.js');
const debug = require('debug')('frigelar-api:server');
const http = require('http');
const app = require('./src/app');
const os = require('os');
require('./config');

loaders();
var ifaces = os.networkInterfaces();

console.log("*=========================================*");
console.log("             DSE CONTROLE API              ");
console.log("*=========================================*");

Object.keys(ifaces).forEach(function (ifname) {
  var alias = 0;

  ifaces[ifname].forEach(function (iface) {
    if ('IPv4' !== iface.family || iface.internal !== false) {
      return;
    }

    if (alias >= 1) {
      console.log(ifname + ':' + alias, iface.address);
    } else {
      console.log("IP: " + iface.address);
    }
    ++alias;
  });
});

app.set('port', SERVER.PORT);

const server = http.createServer(app);

server.listen(SERVER.PORT);
server.on('error', onError);
server.on('listening', onListening);

console.log('Porta: ' + SERVER.PORT);
console.log('Host:' + process.env.HOST);
console.log("Banco de dados: "+process.env.DATA_BASE)
console.log("Bucket: "+process.env.BUCKET)

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof SERVER.PORT === 'string' ? 'Pipe ' + SERVER.PORT : 'PORTA: ' + SERVER.PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' Requer privilégios elevados!');
      process.exit(1);
    break;
    case 'EADDRINUSE':
      console.error(bind + ' Está em uso!');
      process.exit(1);
    break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'Porta: ' + addr.PORT;
  debug('Listening on ' + bind);
}