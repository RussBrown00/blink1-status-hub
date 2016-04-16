#!/usr/bin/env node
/**
 * blink1-server
 *
 *
 * @author Tod E. Kurt, http://todbot.com/blog
 *
 */

"use strict";

var Blink1 = require('node-blink1');
var parsecolor = require('parse-color');
var express = require('express');
var getInterface = require('interface-addresses');

var app = express();

app.set('json spaces', 4);

var port = 4949;
var host = '127.0.0.1';

var devices = Blink1.devices(); // returns array of serial numbers
var blink1 = null;
if( devices.length ) {
    blink1 = new Blink1();
}

var lastColor = '#000000';
var lastTime = 0;
var lastLedn = 0;
var lastRepeats = 0;

// rescan if we know we have no blink1
var blink1TryConnect = function() {
    if( blink1 ) { return; }
    devices = Blink1.devices();
    if( devices.length ) {
        blink1 = new Blink1();
    }
};

// Call blink1.fadeToRGB while dealing with disconnect / reconnect of blink1
var blink1Fade = function( millis, r, g, b, ledn ){
    blink1TryConnect();
    if( !blink1 ) { return "no blink1"; }
    try {
        blink1.fadeToRGB( millis, r, g, b, ledn );
    } catch(err) {
        blink1 = null;
        return ""+err;
    }
    return "success";
};

var blink1Blink = function( onoff, repeats, millis, r, g, b, ledn ) {
    if( onoff ) {
        blink1Fade( millis/2, r, g, b, ledn );
    } else {
        blink1Fade( millis/2, 0, 0, 0, ledn );
        repeats--;
    }
    onoff = !onoff;
    if( repeats ) {
        setTimeout( function() {
            blink1Blink(onoff, repeats, millis, r, g, b, ledn);
        }, millis );
    }
};

app.get('/status', function(req, res) {
    blink1TryConnect();
    var response = {
        blink1Connected: blink1 !== null,
        blink1Serials: devices,
        lastColor: lastColor,
        lastTime: lastTime,
        lastLedn: lastLedn,
        lastRepeats: lastRepeats,
        cmd: "info",
        status: "success"
    };
    res.json( response );
});

function runCommand(_hex, _time, _ledn, repeats, res) {
	var status = "success";
    var color = parsecolor(_hex);
    var time = _time || 1;
    var ledn = _ledn || 2;
	var rgb = color.rgb;

	if( rgb ) {
		lastColor = color.hex;
		lastTime = time;
		lastLedn = ledn;

		if (repeats) {
			lastRepeats = repeats;
			blink1Blink( true, repeats, time*1000, rgb[0], rgb[1], rgb[2], ledn );
		} else {
			status = blink1Fade( time*1000, rgb[0], rgb[1], rgb[2], ledn );
		}
    } else {
        status = "bad hex color specified " + _hex;
    }

    var response = {
        blink1Connected: blink1 !== null,
        blink1Serials: devices,
        lastColor: lastColor,
        lastTime: lastTime,
        lastLedn: lastLedn,
        lastRepeats: lastRepeats,
        cmd: "fadeToRGB",
        status: status
    };

	res.json( response );
}

app.get('/', function(req, res) {
	runCommand(
		req.query.rgb,
		Number(req.query.time) || .3,
		Number(req.query.ledn) || 0,
		null,
		res
	);
});

app.get('/blink', function(req, res) {
	runCommand(
		req.query.rgb,
		Number(req.query.time) || .1,
		Number(req.query.ledn) || 0,
		Number(req.query.repeats) || Number(req.query.count) || 3,
		res
	);
});

app.get(/\/(off|clear)/, function(req, res) {
	runCommand('#000000', .1, 0, null, res);
});

app.get('/free', function(req, res) {
	runCommand('#000000', 0, 2, null, res);
});

app.get('/dnd', function(req, res) {
	runCommand(
		req.query.rgb || '#ff3300',
		Number(req.query.time) || 1,
		Number(req.query.ledn) || 2,
		null,
		res
	);
});

app.get('/done', function(req, res) {
	runCommand(
		req.query.rgb || '#66ff66',
		Number(req.query.time) || .1,
		Number(req.query.ledn) || 1,
		Number(req.query.repeats) || Number(req.query.count) || 4,
		res
	);
});

app.get('/fail', function(req, res) {
	runCommand(
		req.query.rgb || '#ff33cc',
		Number(req.query.time) || .1,
		Number(req.query.ledn) || 1,
		Number(req.query.repeats) || Number(req.query.count) || 4,
		res
	);
});

// if we have args
if (process.argv.length >= 2) {
    port = Number(process.argv[2]) || port;
}

if (process.argv.length >= 3) {
    var ifc = process.argv[3] || 'en0';
    host = getInterface()[ifc] || host;
}

var server = app.listen(port, host, function() {
    var host = server.address().address;
    var port = server.address().port;
    host = (host === '::' ) ? "localhost" : host;

    console.log('blink1-server listening at http://%s:%s/', host, port);
});
