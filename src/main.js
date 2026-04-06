const { InstanceBase, InstanceStatus, Regex, runEntrypoint } = require('@companion-module/base')
const net = require('net')
const upgrades = require('./upgrades')
const actions = require('./actions')
const feedbacks = require('./feedbacks')
const variables = require('./variables')
const presets = require('./presets')

const MAX_BUFFER = 65536

class SlidelizerInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.currentTime = '00:00'
		this.videoRemaining = '--:--'
		this.client = null
		this._reconnectTimer = null
		this._reconnectDelay = 1000
		this.config = {
			host: '127.0.0.1',
			port: 12345,
		}
	}

	async init(config) {
		this.config = config || {}
		this.updateStatus(InstanceStatus.Disconnected)
		variables(this)
		actions(this)
		feedbacks(this)
		presets(this)
		await this._maybeConnect()
	}

	async configUpdated(config) {
		this.config = config || {}
		await this._disconnect()
		await this._maybeConnect()
	}

	getConfigFields() {
		return [
			{ type: 'textinput', id: 'host', label: 'Host', width: 6, default: '127.0.0.1', regex: Regex.IP },
			{ type: 'number', id: 'port', label: 'Port', width: 6, default: 12345, min: 1, max: 65535 },
		]
	}

	async destroy() {
		await this._disconnect()
		if (this._reconnectTimer) {
			clearTimeout(this._reconnectTimer)
			this._reconnectTimer = null
		}
	}

	async _maybeConnect() {
		const host = this.config?.host || '127.0.0.1'
		const port = Number(this.config?.port || 12345)
		if (!host || !port || Number.isNaN(port)) {
			this.updateStatus(InstanceStatus.Disconnected, 'Configure host/port')
			return
		}
		await this._connect(host, port)
	}

	async _connect(host, port) {
		try {
			this.client = new net.Socket()
			this.client.setEncoding('utf8')
			this.client.setTimeout(5000)
			this.client.on('timeout', () => {
				this.log('warn', 'Connection timeout')
				this.client.destroy()
			})
			this.client.connect(port, host, () => {
				this.log('info', `Connected to Slidelizer at ${host}:${port}`)
				this.updateStatus(InstanceStatus.Ok)
				this._reconnectDelay = 1000
				if (this._reconnectTimer) {
					clearTimeout(this._reconnectTimer)
					this._reconnectTimer = null
				}
			})
			this.client.on('error', (err) => {
				this.log('error', `Socket error: ${err.message}`)
				this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
				this._scheduleReconnect()
			})
			this.client.on('close', () => {
				this.updateStatus(InstanceStatus.Disconnected)
				this._scheduleReconnect()
			})
			let buffer = ''
			this.client.on('data', (chunk) => {
				buffer += chunk
				if (buffer.length > MAX_BUFFER) {
					this.log('error', 'Buffer overflow - resetting')
					buffer = ''
					return
				}
				let nl
				while ((nl = buffer.indexOf('\n')) >= 0) {
					const line = buffer.substring(0, nl).trim()
					buffer = buffer.substring(nl + 1)
					if (line.length > 0) {
						if (line.startsWith('VIDEO:')) {
							this.videoRemaining = line.substring(6)
							const vParts = this.videoRemaining.split(':')
							const vMm = vParts.length >= 2 ? vParts[0].padStart(2, '0') : '--'
							const vSs = vParts.length >= 2 ? vParts[1].padStart(2, '0') : '--'
							this.setVariableValues({
								videoRemaining: this.videoRemaining,
								videoRemaining_mm: vMm,
								videoRemaining_ss: vSs,
							})
							this.checkFeedbacks('show_video_time')
						} else {
							const isClockLike = /^\d{2}:\d{2}:\d{2}$/.test(line)
							this.mode = isClockLike ? 'CLOCK' : 'TIMER'
							this.currentTime = line
							const { mmss, mm, ss, hhmm, hh, hhmmss, remainMm } = this._formatVariants(this.currentTime, this.mode)
							this.setVariableValues({
								timerValue: mmss,
								timerValue_mmss: mmss,
								timerValue_mm: mm,
								timerValue_ss: ss,
								timerValue_hhmm: hhmm,
								timerValue_hh: hh,
								timerValue_hhmmss: hhmmss,
								timerValue_remain_mm: remainMm,
								mode: this.mode,
							})
							this.checkFeedbacks('show_time')
							this.checkFeedbacks('show_time_mm')
							this.checkFeedbacks('show_time_ss')
							this.checkFeedbacks('show_time_hhmm')
							this.checkFeedbacks('show_time_hh')
							this.checkFeedbacks('show_time_hhmmss')
							this.checkFeedbacks('show_time_remain_mm')
						}
					}
				}
			})
		} catch (e) {
			this.updateStatus(InstanceStatus.ConnectionFailure, e.message)
		}
	}

	async _disconnect() {
		if (this.client) {
			try {
				this.client.destroy()
			} catch (e) {
				this.log('debug', 'Disconnect cleanup: ' + e.message)
			}
			this.client = null
		}
		this.updateStatus(InstanceStatus.Disconnected)
	}

	_send(text) {
		if (!text || typeof text !== 'string') return
		if (!this.client) {
			this.updateStatus(InstanceStatus.Disconnected)
			this.log('warn', 'Not connected')
			return
		}
		try {
			this.client.write(text)
		} catch (e) {
			this.log('error', `Send failed: ${e.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, e.message)
		}
	}

	_scheduleReconnect() {
		try {
			if (this._reconnectTimer) return
			const delay = Math.min(this._reconnectDelay, 10000)
			this.log('info', `Reconnecting in ${delay}ms...`)
			this._reconnectTimer = setTimeout(async () => {
				this._reconnectTimer = null
				this._reconnectDelay = Math.min(this._reconnectDelay * 2, 10000)
				await this._maybeConnect()
			}, delay)
		} catch (e) {
			this.log('debug', 'Reconnect scheduling: ' + e.message)
		}
	}

	_formatVariants(text, mode) {
		if (!text || typeof text !== 'string') return { mmss: '00:00', mm: '00', ss: '00', hhmm: '00:00' }
		const parts = text.split(':').map((p) => p.padStart(2, '0'))
		let hours = 0,
			minutes = 0,
			seconds = 0
		if (parts.length === 3) {
			hours = Number(parts[0]) || 0
			minutes = Number(parts[1]) || 0
			seconds = Number(parts[2]) || 0
		} else if (parts.length === 2) {
			minutes = Number(parts[0]) || 0
			seconds = Number(parts[1]) || 0
		} else {
			const m = text.match(/^(\d{1,3})(\d{2})$/)
			if (m) {
				minutes = Number(m[1]) || 0
				seconds = Number(m[2]) || 0
			}
		}
		const totalMinutes = hours * 60 + minutes
		const SS = String(Math.max(0, Math.min(59, seconds))).padStart(2, '0')
		let mm, ss, mmss, hhmm
		if (mode === 'CLOCK') {
			const HH = String(hours).padStart(2, '0')
			const MM = String(minutes).padStart(2, '0')
			mm = MM
			ss = SS
			mmss = `${MM}:${SS}`
			hhmm = `${HH}:${MM}`
		} else {
			mm = String(totalMinutes).padStart(2, '0')
			ss = SS
			mmss = `${mm}:${ss}`
			const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
			const remainMm = String(totalMinutes % 60).padStart(2, '0')
			hhmm = `${hh}:${remainMm}`
		}
		let hh, hhmmss, remainMm
		if (mode === 'CLOCK') {
			hh = String(hours).padStart(2, '0')
			remainMm = String(minutes).padStart(2, '0')
			hhmmss = `${hh}:${remainMm}:${SS}`
		} else {
			hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
			remainMm = String(totalMinutes % 60).padStart(2, '0')
			hhmmss = `${hh}:${remainMm}:${ss}`
		}
		return { mmss, mm, ss, hhmm, hh, hhmmss, remainMm }
	}
}

runEntrypoint(SlidelizerInstance, upgrades)
