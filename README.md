# blink1-status-hub
HTTP REST API server in Node for [blink(1)](https://blink1.thingm.com/) devices

Supports plug and unplug of [blink(1)](https://blink1.thingm.com/) while server is running.

Uses new `node-hid@0.5.0` so works with Node 4.x.

This code base was based off of [node-blink1-server](https://www.npmjs.com/package/node-blink1-server). I wanted to build something that was geared more towards productivity enhancers vs just a play tool. I wrote this with the expectation that I would be performing most of my long running tasks on virtual machine. Running this on a Raspberry Pi or Beaglebone would also be a cool use.

I use `/dnd` to show that I'm currently on a phone call (busy light) and I use `/done` and `/fail` for work tasks. The [Blink(1)](https://blink1.thingm.com/) has 2 LEDs.

### Installation

Install globally and use on the commandline:
```
npm install -g blink1-status-hub

# starts server on 127.0.0.1:4949
blink1-server

# starts server on port 127.0.0.1:080
blink1-server 8080

# starts server on 4949 using en0's IP (osx)
blink1-server 4949 en0

# starts server on 4949 using eth0's IP (linux)
blink1-server 4949 eth0

# starts server running on local parallels VM host adapter
blink1-server 4949 vnic0
```

Or check out and use via npm:
```
git clone git@github.com:902Labs/blink1-status-hub.git
cd blink1-status-hub
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
- `/fail` -- Alias to `/blink` that defaults to flashing the #1 LED pink 4 times.
- `/free` -- Turns off just the #2 LED used for `/dnd`.

### My setup of choice

I run this service on my host machine. My host and virtual machines all have aliases created in `~/.profile` that allow for quick execution

#### My OSX Laptop/Parallels Host
```
getIP() {
	ifconfig $1 | awk '$1 == "inet" {print $2}'
}

alias blink-off="curl -s \"http://$(getIP vnic0):4949/clear\" > /dev/null"
alias blink-clear="blink-off"
alias blink-dnd="curl -s \"http://$(getIP vnic0):4949/dnd\" > /dev/null"
alias blink-free="curl -s \"http://$(getIP vnic0):4949/free\" > /dev/null"
alias blink-done="curl -s \"http://$(getIP vnic0):4949/done\" > /dev/null"
alias blink-fail="curl -s \"http://$(getIP vnic0):4949/fail\" > /dev/null"
```

#### One of my virtual machines I run docker from
```
HOSTIP="10.211.55.2"

alias blink-off="curl -s \"http://$HOSTIP:4949/clear\" > /dev/null"
alias blink-clear="blink-off"
alias blink-dnd="curl -s \"http://$HOSTIP:4949/dnd\" > /dev/null"
alias blink-free="curl -s \"http://$HOSTIP:4949/free\" > /dev/null"
alias blink-done="curl -s \"http://$HOSTIP:4949/done\" > /dev/null"
alias blink-done="curl -s \"http://$HOSTIP:4949/fail\" > /dev/null"
```

### How I use it

```
# simple example
> sleep 5; blink-done

# with error example
> sleep 5 && cd /imaginary-folder && blink-done || blink-fail
```

