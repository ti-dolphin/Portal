const winston = require('winston');
const Transport = require("winston-transport");
// Imports the Google Cloud client library for Winston
const {LoggingWinston} = require('@google-cloud/logging-winston');
// import { LoggingWinston } from '@google-cloud/logging-winston';
// import pubSub from '../pub_sub/pubSub.js';
const {LogModel, RoxLogger} = require('rox-lib');


var logger;
var winstonLogger;

const level = process.env.LOG_LEVEL || "info";

class SimpleConsoleTransport extends Transport {
  log = (info, callback) => {
    setImmediate(() => this.emit("logged", info));

    // pubSub.publish("log_email", info.description ?? info.message ?? '');

    if (info.level === "error") {
      console.error(info.description ?? info.message ?? info);
    } else if (info.level === "info") {
      console.info(info.description ?? info.message ?? info);
    } else if (info.level === "warn") {
      console.warn(info.description ?? info.message ?? info);
    } else {
      console.log(info.description ?? info.message ?? info);
    }

    if (callback) {
      callback();
    }
  };

}

class ExceptionTransporter extends Transport {
  log = (info, callback) => {
    setImmediate(() => this.emit("logged", info));
    logger.log(new LogModel(
      'error',
      'Erro não tratado',
      'Erro não tratado',
      'UNHANDLED_ERROR',
      info,
    ));
    if (callback) {
      callback();
    }
  };
}

const gcpLogTransport = new LoggingWinston(
  {
    projectId: 'roxcode',
    keyFilename: './roxcode-1a9ea691cbb8.json',
    logName: 'dse-controle-api',
    maxEntrySize: 256000,
    // silent: false,
    defaultCallback: err => {
      if (err) {
        const stack = (new Error()).stack;
        logger.log(new LogModel(
          'error',
          'Erro ao enviar log para o GCP',
          'Erro ao enviar log para o GCP',
          'WINSTON_ERROR',
          {
            "error": err,
            "stack": stack,
          },
        ));
        return err;
      }
    },
  }
);


const winstonLoader = () => {
  try {
    winstonLogger = winston.createLogger({
      level: 'info',
      transports: [
        new SimpleConsoleTransport(),
        gcpLogTransport
      ],
    });
  
    winstonLogger.exceptions.handle(
      [
        new ExceptionTransporter(),
      ]);
    winstonLogger.rejections.handle(
      [
        new ExceptionTransporter(),
      ]);
  
      logger = new RoxLogger(winstonLogger);
      global.logger = logger;
      logger.info('Winston Logger Initialized');
    
  } catch (error) {
    console.log("erro ao iniciar winston", error);
  }
}

// export {
//   logger,
//   winstonLoader,
// }

module.exports = {
  logger,
  winstonLoader,
}