import Redis from 'ioredis'

const safeJSONParse = (str) => {
	try {
		return JSON.parse(str)
	} catch (e) {
		return null
	}
}

export class RedisDriver {
	constructor(options) {
		this.conn = new Redis(options)
	}

	async prepare(_table) {}

	async getAllRows(_table) {
		const keys = await this.conn.keys('*')

		if (!keys.length) return []

		const data = await this.conn.mget(keys)

		return data.map((it, index) => ({ id: keys[index], value: safeJSONParse(it) }))
	}

	async setRowByKey(_table, key, value, _update) {
		await this.conn.set(key, JSON.stringify(value))
		return value
	}

	async getRowByKey(_table, key) {
		const data = await this.conn.get(key)
		const parsed = safeJSONParse(data)
		return parsed ? [parsed, true] : [null, false]
	}

	async deleteAllRows(_table) {
		await this.conn.flushall()
		return 0
	}

	async deleteRowByKey(_table, key) {
		return await this.conn.del(key)
	}
}
