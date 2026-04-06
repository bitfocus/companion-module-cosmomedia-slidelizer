module.exports = function (self) {
	self.setFeedbackDefinitions({
		show_time: {
			type: 'advanced',
			name: 'Timer (mm:ss)',
			description: 'Shows the timer as mm:ss. In clock mode shows hh:mm.',
			options: [],
			callback: () => {
				const { mmss, hhmm } = self._formatVariants(self.currentTime, self.mode)
				const text = self.mode === 'CLOCK' ? hhmm || '00:00' : mmss || '00:00'
				return { text }
			},
		},
		show_time_mm: {
			type: 'advanced',
			name: 'Total Minutes (mm)',
			description: 'Shows total minutes as a single number. For a 1h39m timer this shows 99. Use this together with the Seconds (ss) feedback for a two-button mm + ss layout.',
			options: [],
			callback: () => {
				const { mm } = self._formatVariants(self.currentTime, self.mode)
				return { text: mm || '00' }
			},
		},
		show_time_remain_mm: {
			type: 'advanced',
			name: 'Minutes within Hour (mm)',
			description: 'Shows the minutes portion within the current hour. For a 1h39m timer this shows 39. Use this together with the Hours (hh) and Seconds (ss) feedbacks for a three-button hh + mm + ss layout.',
			options: [],
			callback: () => {
				const { remainMm } = self._formatVariants(self.currentTime, self.mode)
				return { text: remainMm || '00' }
			},
		},
		show_time_ss: {
			type: 'advanced',
			name: 'Seconds (ss)',
			description: 'Shows the seconds portion of the timer.',
			options: [],
			callback: () => {
				const { ss } = self._formatVariants(self.currentTime, self.mode)
				return { text: ss || '00' }
			},
		},
		show_time_hh: {
			type: 'advanced',
			name: 'Hours (hh)',
			description: 'Shows the hours portion of the timer. For a 1h39m timer this shows 01.',
			options: [],
			callback: () => {
				const { hh } = self._formatVariants(self.currentTime, self.mode)
				return { text: hh || '00' }
			},
		},
		show_time_hhmm: {
			type: 'advanced',
			name: 'Time (hh:mm)',
			description: 'Shows the time in hh:mm format. For a 99 minute timer this shows 01:39.',
			options: [],
			callback: () => {
				const { hhmm } = self._formatVariants(self.currentTime, self.mode)
				return { text: hhmm || '00:00' }
			},
		},
		show_time_hhmmss: {
			type: 'advanced',
			name: 'Time (hh:mm:ss)',
			description: 'Shows the full time in hh:mm:ss format. For a 99 minute timer this shows 01:39:00.',
			options: [],
			callback: () => {
				const { hhmmss } = self._formatVariants(self.currentTime, self.mode)
				return { text: hhmmss || '00:00:00' }
			},
		},
		show_video_time: {
			type: 'advanced',
			name: 'Video Remaining (mm:ss)',
			description: 'Shows the remaining playback time of the video on the current PowerPoint slide.',
			options: [],
			callback: () => {
				return { text: self.videoRemaining || '--:--' }
			},
		},
	})
}
