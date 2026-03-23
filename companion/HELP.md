## Slidelizer

Remote control for the [Slidelizer](https://www.cosmomedia.de) application via TCP.

### Configuration

| Setting | Description | Default |
|---------|-------------|---------|
| **Host** | IP address of the machine running Slidelizer | `127.0.0.1` |
| **Port** | TCP port configured in Slidelizer | `12345` |

### Actions

**Timer**

- Start / Pause / Reset
- Add Minute / Subtract Minute
- Add Second / Subtract Second
- Set Time (mm:ss)
- Toggle Clock / Timer mode

**NDI Slide Sender**

- Next Slide
- Previous Slide

### Variables

| Variable | Description |
|----------|-------------|
| `timerValue` | Current timer value (mm:ss) |
| `timerValue_mmss` | Timer (mm:ss) |
| `timerValue_mm` | Minutes |
| `timerValue_ss` | Seconds |
| `timerValue_hhmm` | Time (hh:mm) |
| `mode` | Current mode (TIMER / CLOCK) |
| `videoRemaining` | Video remaining time (mm:ss) |
| `videoRemaining_mm` | Video remaining minutes |
| `videoRemaining_ss` | Video remaining seconds |

### Feedbacks

- **Show Timer (mm:ss)** – displays timer or clock value on the button
- **Show Timer (mm)** – minutes only
- **Show Timer (ss)** – seconds only
- **Show Time (hh:mm)** – time in hh:mm format
- **Show Video Remaining (mm:ss)** – remaining time of the video playing on the current PowerPoint slide
