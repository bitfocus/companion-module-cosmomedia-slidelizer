module.exports = function (self) {
	self.setActionDefinitions({
		start: {
			name: 'Start timer',
			options: [],
			callback: () => self._send('START\n'),
		},
		pause: {
			name: 'Pause timer',
			options: [],
			callback: () => self._send('PAUSE\n'),
		},
		reset: {
			name: 'Reset timer',
			options: [],
			callback: () => self._send('RESET\n'),
		},
		add_minute: {
			name: 'Add minute',
			options: [],
			callback: () => self._send('ADD MINUTE\n'),
		},
		sub_minute: {
			name: 'Subtract minute',
			options: [],
			callback: () => self._send('SUBTRACT MINUTE\n'),
		},
		add_second: {
			name: 'Add second',
			options: [],
			callback: () => self._send('ADD SECOND\n'),
		},
		sub_second: {
			name: 'Subtract second',
			options: [],
			callback: () => self._send('SUBTRACT SECOND\n'),
		},
		set_time: {
			name: 'Set time (mm:ss)',
			options: [{ type: 'textinput', id: 'mmss', label: 'mm:ss', default: '30:00' }],
			callback: (event) => {
				const mmss = (event.options?.mmss || '30:00').toString().trim()
				self._send(`SET ${mmss}\n`)
			},
		},
		toggle_clock: {
			name: 'Toggle Clock/Timer',
			options: [],
			callback: () => self._send('TOGGLE_CLOCK\n'),
		},
		ndi_next: {
			name: 'NDI Slide Sender: Next slide',
			options: [],
			callback: () => self._send('NDI_NEXT\n'),
		},
		ndi_prev: {
			name: 'NDI Slide Sender: Previous slide',
			options: [],
			callback: () => self._send('NDI_PREV\n'),
		},
	})
}
