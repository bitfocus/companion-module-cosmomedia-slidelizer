const { InstanceBase, InstanceStatus, Regex, runEntrypoint } = require('@companion-module/base')
const net = require('net')

class SlidelizerInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		this.currentTime = '00:00'
		this.videoRemaining = '--:--'
		this.timerRunning = false
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
		this.setVariableDefinitions([
			{ variableId: 'timerValue', name: 'Current timer value (mm:ss)' },
			{ variableId: 'timerValue_mmss', name: 'Timer (mm:ss)' },
			{ variableId: 'timerValue_mm', name: 'Timer minutes (mm or total minutes)' },
			{ variableId: 'timerValue_ss', name: 'Timer seconds (ss)' },
			{ variableId: 'timerValue_hhmm', name: 'Time (hh:mm)' },
			{ variableId: 'mode', name: 'Mode (TIMER/CLOCK)' },
			{ variableId: 'videoRemaining', name: 'Video remaining time (mm:ss)' },
			{ variableId: 'videoRemaining_mm', name: 'Video remaining minutes (mm)' },
			{ variableId: 'videoRemaining_ss', name: 'Video remaining seconds (ss)' },
		])
		this._initActions()
		this._initFeedbacks()
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
							const { mmss, mm, ss, hhmm } = this._formatVariants(this.currentTime, this.mode)
							this.setVariableValues({
								timerValue: mmss,
								timerValue_mmss: mmss,
								timerValue_mm: mm,
								timerValue_ss: ss,
								timerValue_hhmm: hhmm,
								mode: this.mode,
							})
							this.checkFeedbacks('show_time')
							this.checkFeedbacks('show_time_mm')
							this.checkFeedbacks('show_time_ss')
							this.checkFeedbacks('show_time_hhmm')
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
			} catch (e) {}
			this.client = null
		}
		this.updateStatus(InstanceStatus.Disconnected)
	}

	_initActions() {
		this.setActionDefinitions({
			start: {
				name: 'Start timer',
				options: [],
				callback: () => this._send('START\n'),
			},
			pause: {
				name: 'Pause timer',
				options: [],
				callback: () => this._send('PAUSE\n'),
			},
			reset: {
				name: 'Reset timer',
				options: [],
				callback: () => this._send('RESET\n'),
			},
			add_minute: {
				name: 'Add minute',
				options: [],
				callback: () => this._send('ADD MINUTE\n'),
			},
			sub_minute: {
				name: 'Subtract minute',
				options: [],
				callback: () => this._send('SUBTRACT MINUTE\n'),
			},
			add_second: {
				name: 'Add second',
				options: [],
				callback: () => this._send('ADD SECOND\n'),
			},
			sub_second: {
				name: 'Subtract second',
				options: [],
				callback: () => this._send('SUBTRACT SECOND\n'),
			},
			set_time: {
				name: 'Set time (mm:ss)',
				options: [{ type: 'textinput', id: 'mmss', label: 'mm:ss', default: '30:00' }],
				callback: (event) => {
					const mmss = (event.options?.mmss || '30:00').toString().trim()
					this._send(`SET ${mmss}\n`)
				},
			},
			toggle_clock: {
				name: 'Toggle Clock/Timer',
				options: [],
				callback: () => this._send('TOGGLE_CLOCK\n'),
			},
			ndi_next: {
				name: 'NDI Slide Sender: Next slide',
				options: [],
				callback: () => this._send('NDI_NEXT\n'),
			},
			ndi_prev: {
				name: 'NDI Slide Sender: Previous slide',
				options: [],
				callback: () => this._send('NDI_PREV\n'),
			},
		})
	}

	_initFeedbacks() {
		this.setFeedbackDefinitions({
			show_time: {
				type: 'advanced',
				name: 'Show Timer (mm:ss)',
				description: 'Displays the current timer or clock value',
				options: [],
				callback: () => {
					const { mmss, hhmm } = this._formatVariants(this.currentTime, this.mode)
					const text = this.mode === 'CLOCK' ? hhmm || '00:00' : mmss || '00:00'
					return { text }
				},
			},
			show_time_mm: {
				type: 'advanced',
				name: 'Show Timer (mm)',
				description: 'Displays the minutes portion of the timer',
				options: [],
				callback: () => {
					const { mm } = this._formatVariants(this.currentTime, this.mode)
					return { text: mm || '00' }
				},
			},
			show_time_ss: {
				type: 'advanced',
				name: 'Show Timer (ss)',
				description: 'Displays the seconds portion of the timer',
				options: [],
				callback: () => {
					const { ss } = this._formatVariants(this.currentTime, this.mode)
					return { text: ss || '00' }
				},
			},
			show_time_hhmm: {
				type: 'advanced',
				name: 'Show Time (hh:mm)',
				description: 'Displays the time in hh:mm format',
				options: [],
				callback: () => {
					const { hhmm } = this._formatVariants(this.currentTime, this.mode)
					return { text: hhmm || '00:00' }
				},
			},
			show_video_time: {
				type: 'advanced',
				name: 'Show Video Remaining (mm:ss)',
				description: 'Remaining time of the video playing on the current PowerPoint slide',
				options: [],
				callback: () => {
					return { text: this.videoRemaining || '--:--' }
				},
			},
		})
	}

	_send(text) {
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
		} catch {}
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
		let mm, ss, mmss
		const HH = String(hours).padStart(2, '0')
		const MM = String(minutes).padStart(2, '0')
		const SS = String(Math.max(0, Math.min(59, seconds))).padStart(2, '0')
		if (mode === 'CLOCK') {
			mm = HH
			ss = MM
			mmss = `${SS}:${MM}`
		} else {
			const totalMinutes = hours * 60 + minutes
			mm = String(totalMinutes).padStart(2, '0')
			ss = SS
			mmss = `${mm}:${ss}`
		}
		const hhmm = `${HH}:${MM}`
		return { mmss, mm, ss, hhmm }
	}
}

runEntrypoint(SlidelizerInstance, [])
