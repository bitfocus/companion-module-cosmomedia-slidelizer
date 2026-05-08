const { combineRgb } = require('@companion-module/base')

module.exports = function (self) {
	const white = combineRgb(255, 255, 255)
	const black = combineRgb(0, 0, 0)
	const green = combineRgb(0, 180, 0)
	const red = combineRgb(180, 0, 0)
	const yellow = combineRgb(180, 180, 0)
	const blue = combineRgb(0, 80, 180)
	const gray = combineRgb(60, 60, 60)

	self.setPresetDefinitions({
		timer_start: {
			type: 'button',
			category: 'Timer Controls',
			name: 'Start',
			style: {
				text: 'START',
				size: '18',
				color: white,
				bgcolor: green,
			},
			steps: [{ down: [{ actionId: 'start' }], up: [] }],
			feedbacks: [],
		},
		timer_pause: {
			type: 'button',
			category: 'Timer Controls',
			name: 'Pause',
			style: {
				text: 'PAUSE',
				size: '18',
				color: white,
				bgcolor: yellow,
			},
			steps: [{ down: [{ actionId: 'pause' }], up: [] }],
			feedbacks: [],
		},
		timer_reset: {
			type: 'button',
			category: 'Timer Controls',
			name: 'Reset',
			style: {
				text: 'RESET',
				size: '18',
				color: white,
				bgcolor: red,
			},
			steps: [{ down: [{ actionId: 'reset' }], up: [] }],
			feedbacks: [],
		},
		timer_add_minute: {
			type: 'button',
			category: 'Timer Controls',
			name: '+1 Minute',
			style: {
				text: '+1 MIN',
				size: '18',
				color: white,
				bgcolor: gray,
			},
			steps: [{ down: [{ actionId: 'add_minute' }], up: [] }],
			feedbacks: [],
		},
		timer_sub_minute: {
			type: 'button',
			category: 'Timer Controls',
			name: '-1 Minute',
			style: {
				text: '-1 MIN',
				size: '18',
				color: white,
				bgcolor: gray,
			},
			steps: [{ down: [{ actionId: 'sub_minute' }], up: [] }],
			feedbacks: [],
		},
		timer_add_second: {
			type: 'button',
			category: 'Timer Controls',
			name: '+1 Second',
			style: {
				text: '+1 SEC',
				size: '18',
				color: white,
				bgcolor: gray,
			},
			steps: [{ down: [{ actionId: 'add_second' }], up: [] }],
			feedbacks: [],
		},
		timer_sub_second: {
			type: 'button',
			category: 'Timer Controls',
			name: '-1 Second',
			style: {
				text: '-1 SEC',
				size: '18',
				color: white,
				bgcolor: gray,
			},
			steps: [{ down: [{ actionId: 'sub_second' }], up: [] }],
			feedbacks: [],
		},
		timer_toggle_clock: {
			type: 'button',
			category: 'Timer Controls',
			name: 'Toggle Clock/Timer',
			style: {
				text: 'TOGGLE\\nCLOCK',
				size: '14',
				color: white,
				bgcolor: blue,
			},
			steps: [{ down: [{ actionId: 'toggle_clock' }], up: [] }],
			feedbacks: [],
		},

		display_mmss: {
			type: 'button',
			category: 'Timer Display',
			name: 'Timer (mm:ss)',
			style: {
				text: '$(Slidelizer:timerValue_mmss)',
				size: '18',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_mm: {
			type: 'button',
			category: 'Timer Display',
			name: 'Total Minutes (mm)',
			style: {
				text: '$(Slidelizer:timerValue_mm)',
				size: '18',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_remain_mm: {
			type: 'button',
			category: 'Timer Display',
			name: 'Minutes within Hour (mm)',
			style: {
				text: '$(Slidelizer:timerValue_remain_mm)',
				size: '18',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_ss: {
			type: 'button',
			category: 'Timer Display',
			name: 'Seconds (ss)',
			style: {
				text: '$(Slidelizer:timerValue_ss)',
				size: '18',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_hhmm: {
			type: 'button',
			category: 'Timer Display',
			name: 'Time (hh:mm)',
			style: {
				text: '$(Slidelizer:timerValue_hhmm)',
				size: '18',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_hh: {
			type: 'button',
			category: 'Timer Display',
			name: 'Hours (hh)',
			style: {
				text: '$(Slidelizer:timerValue_hh)',
				size: '18',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_hhmmss: {
			type: 'button',
			category: 'Timer Display',
			name: 'Time (hh:mm:ss)',
			style: {
				text: '$(Slidelizer:timerValue_hhmmss)',
				size: '14',
				color: green,
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},
		display_video: {
			type: 'button',
			category: 'Timer Display',
			name: 'Video Remaining (mm:ss)',
			style: {
				text: '$(Slidelizer:videoRemaining)',
				size: '18',
				color: combineRgb(255, 165, 0),
				bgcolor: black,
			},
			steps: [],
			feedbacks: [],
		},

		ndi_next: {
			type: 'button',
			category: 'NDI Slide Sender',
			name: 'Next Slide',
			style: {
				text: 'NEXT\\nSLIDE',
				size: '14',
				color: white,
				bgcolor: gray,
			},
			steps: [{ down: [{ actionId: 'ndi_next' }], up: [] }],
			feedbacks: [],
		},
		ndi_prev: {
			type: 'button',
			category: 'NDI Slide Sender',
			name: 'Previous Slide',
			style: {
				text: 'PREV\\nSLIDE',
				size: '14',
				color: white,
				bgcolor: gray,
			},
			steps: [{ down: [{ actionId: 'ndi_prev' }], up: [] }],
			feedbacks: [],
		},
	})
}
