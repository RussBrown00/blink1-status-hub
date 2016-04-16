# blink1-status-hub
HTTP REST API server in Node for blink(1) devices

Supports plug and unplug of blink(1) while server is running.

Uses new `node-hid@0.5.0` so works with Node 4.x.

This code base was based off of [node-blink1-server](https://www.npmjs.com/package/node-blink1-server). I wanted to build something that was geared more towards productivity enhancers vs just a play tool.

### Installation

Install globally and use on the commandline:
```
npm install -g node-blink1-server
blink1-server 8754   # starts server on port 8754
```

Or check out and use via npm:
```
git clone https://github.com/todbot/node-blink1-server.git
cd node-blink1-server
npm install
npm start 4949
```

### Supported URIs:
- `/status`  -- status info about connected blink1s, lastColor, etc.
- `/clear` -- fade blink(1) off -- Both LEDs:
- `/off` -- fade blink(1) off -- Both LEDs:
- `/` -- fade blink(1) to a color. query args:
    - `rgb` -- hex color code (e.g. "#ff00ff") [required]
    - `time` -- fade time in seconds (default: 0.3)
    - `ledn` -- LED to control (0=both, 1=top, 2=bottom; default: 0)
- `/blink` -- blink a color, query args:
    - `rgb` -- hex color code (e.g. "`#ff00ff`") [required]
    - `time` -- fade & blink time in seconds (default: 0.1)
    - `ledn` -- LED to control (0=both, 1=top, 2=bottom; default: 0)
    - `repeats` -- number of times to blink (default: 3)
- `/dnd` -- Alias to `/` that defaults to turning the #2 LED red.
- `/done` -- Alias to `/blink` that defaults to flashing the #1 LED green 4 times.
- `/free` -- Turns off just the #2 LED used for `/dnd`.

### How to use it?

I run this service on my host machine. My host and virtual machines all have aliases created in `~/.profile` that allow for quick execution

```
# Blink Server Commands
alias blink-off="curl -s \"http://localhost:4949/clear\" > /dev/null"
alias blink-dnd="curl -s \"http://localhost:4949/dnd\" > /dev/null"
alias blink-free="curl -s \"http://localhost:4949/free\" > /dev/null"
alias blink-done="curl -s \"http://localhost:4949/done\" > /dev/null"
```
