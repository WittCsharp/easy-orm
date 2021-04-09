import * as log4js from 'log4js';

export const LOG_LEVELS = {
    trace: log4js.levels.TRACE,
    debug: log4js.levels.DEBUG,
    info: log4js.levels.INFO,
    warn: log4js.levels.WARN,
    error: log4js.levels.ERROR,
    fatal: log4js.levels.FATAL,
}

const configureLog4js = {
    replaceConsole: true,
    appenders: {
        out: {
            type: 'stdout',
            layout: {
                type: 'colored'
            }
        },
        ruleFile: {
            type: 'dateFile',
            filename: 'log-out',
            pattern: '-yyyy-MM-dd.log',
            alwaysIncludePattern: true,
            daysToKeep: 15,
        }
    },
    categories: {
        default: {
            appenders: [
                'ruleFile'
            ], 
            level: 'all',
        },
        debug: {
            appenders: [
                'ruleFile', 'out'
            ],
            level: 'debug',
        }
    },
    pm2: true,
    pm2InstanceVar: 'INSTANCE_ID',
}

class Logger {
    logger: log4js.Log4js;
    constructor(config?: log4js.Configuration) {
        this.logger = log4js.configure(config || configureLog4js);
    }

    hook(level: log4js.Level) {
        return this.logger.connectLogger(this.logger.getLogger('request'), {
            level: level.levelStr,
            format: (_, __, fmt) => {
                return `${fmt(':date :remote-addr :method :url :status')}`;
            }
        })
    }

    log(options: {
        logger?: string;
        level?: log4js.Level;
        message: string;
    } | string) {
        if (typeof options === 'string') return this._logMessage(options);
        this.logger.getLogger(options.logger)[options.level?.levelStr.toLowerCase() || 'info'](options.message);
    }

    _logMessage(message: string) {
        this.logger.getLogger().debug(message);
    }
}

let logger: Logger;

export default function useLogger(config?: log4js.Configuration) {
    if(config || !logger) {
        logger = new Logger(config);
    }
    return logger;
}