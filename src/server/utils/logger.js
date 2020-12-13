const winston = require('winston');
/* 
levels
    error: 0, 
    warn: 1, 
    info: 2, 
    http: 3,
    verbose: 4, 
    debug: 5, 
    silly: 6
*/

const logger = winston.createLogger({
    format: winston.format.json(),
    defaultMeta: { service: 'sfmc-lwcactivity' },
    transports: [
        new winston.transports.Console({
            level: process.env.LOG_LEVEL || 'info',
            handleExceptions: true,
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

module.exports = logger;
