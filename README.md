# companion-module-cosmomedia-slidelizer

Bitfocus Companion module to control [Slidelizer](https://www.cosmomedia.de) via TCP.

## Features

- **Timer control**: Start, Pause, Reset, Add/Subtract time, Set time, Toggle Clock/Timer
- **NDI Slide Sender**: Next/Previous slide
- **Variables**: Timer value, mode, video remaining time
- **Feedbacks**: Display timer and video time on Stream Deck buttons

## Development

```bash
yarn install
yarn companion-module-build
```

Set the **Developer modules path** in Companion to the parent folder of this module, then add a Slidelizer connection.

## Protocol

The module communicates with Slidelizer over a plain TCP socket (default port 12345).
Commands are newline-terminated strings (`START\n`, `PAUSE\n`, `NDI_NEXT\n`, etc.).
Slidelizer pushes timer values and video remaining times back over the same connection.

See [HELP.md](./companion/HELP.md) and [LICENSE](./LICENSE)
