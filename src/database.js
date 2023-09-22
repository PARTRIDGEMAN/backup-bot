import { QuickDB } from 'quick.db'
import { RedisDriver } from './redis-driver.js'
import config from './config.js'

export default new QuickDB({
	driver: new RedisDriver(config.database)
})
