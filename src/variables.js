module.exports = function (self) {
	self.setVariableDefinitions([
		{ variableId: 'timerValue', name: 'Timer value (mm:ss)' },
		{ variableId: 'timerValue_mmss', name: 'Timer (mm:ss)' },
		{ variableId: 'timerValue_mm', name: 'Total minutes (e.g. 99 for 1h39m)' },
		{ variableId: 'timerValue_ss', name: 'Seconds (ss)' },
		{ variableId: 'timerValue_hhmm', name: 'Time (hh:mm)' },
		{ variableId: 'timerValue_hh', name: 'Hours (hh)' },
		{ variableId: 'timerValue_hhmmss', name: 'Time (hh:mm:ss)' },
		{ variableId: 'timerValue_remain_mm', name: 'Minutes within hour (e.g. 39 for 1h39m)' },
		{ variableId: 'mode', name: 'Mode (TIMER/CLOCK)' },
		{ variableId: 'videoRemaining', name: 'Video remaining time (mm:ss)' },
		{ variableId: 'videoRemaining_mm', name: 'Video remaining minutes (mm)' },
		{ variableId: 'videoRemaining_ss', name: 'Video remaining seconds (ss)' },
	])
}
