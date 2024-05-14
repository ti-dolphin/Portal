const {logger, winstonLoader} = require('./winston.js');

module.exports = function loader() {
    winstonLoader();
    global.logger.info('TESTE');
} 