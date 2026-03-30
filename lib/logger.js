import { createLogger, format, transports } from 'winston'

const isVercel = process.env.VERCEL === '1'

const logTransports = [new transports.Console()]

if (!isVercel) {
  logTransports.push(
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/app.log' })
  )
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}] ${message}`)
  ),
  transports: logTransports,
})

export default logger
