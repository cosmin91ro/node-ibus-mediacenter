var IbusDevices = require('ibus').IbusDevices;
msgs = require('./messages.js');
const { createLogger, format, transports } = require("winston");
require('winston-daily-rotate-file');


Array.prototype.hexToAscii = function(array) {
    if (!this)
        return "";
    var result = "";
    for (var i = 0; i <= this.length - 1; i++) {
        var val = parseInt(this[i], 16);
        if (val > 19 && val < 127) {
            result += String.fromCharCode(val);
        } else {
            result += ".";
        }
    };
    return result;
}

const timezoned = () => {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Bucharest'
    });
}

const log = createLogger({
    transports: [
        new transports.Console({
            format: format.cli(),
            handleExceptions: true,
        }),
        new transports.DailyRotateFile({
            filename: "logs/main-%DATE%.log",
            datePattern: 'YYYY-MM-DDTHH',
            maxSize: '100m',
            handleExceptions: true,
            format: format.combine(format.timestamp({ format: timezoned }), format.json(), format.prettyPrint()),
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: "logs/exceptions.log",
        })
    ],
    defaultMeta: {
        file: __filename.replace(`${__dirname}/`, ''),
    },
    level: process.env.LOG_LEVEL || 'info'
});

String.prototype.asciiToHexString = function(string) {
    if (!this)
        return [];
    var input = this;
    var result = "";
    for (a = 0; a <= input.length - 1; a++) {
        var hex = input.charCodeAt(a).toString(16);
        result += (hex.length < 2 ? "0" + hex : hex) + " ";
    }
    return result.trim();
}

String.prototype.padLeft = function(length, character) {
    try {
        return new Array(length - this.length + 1).join(character || ' ') + this;
    } catch (err) {
        return this;
    }
};

String.prototype.padRight = function(length, character) {
    try {
        return this + new Array(length - this.length + 1).join(character || ' ');
    } catch (err) {
        return this;
    }
};

Date.prototype.toFormattedString = function() {
    var result = String(this.getHours()).padLeft(2, '0') + ':' + String(this.getMinutes()).padLeft(2, '0') + ':' + String(this.getSeconds()).padLeft(2, '0') + '.' + String(this.getMilliseconds()).padLeft(3, '0');
    return result;
};

module.exports = {
    init: function() {

    },

    convertToInt: function(hex) {
        var result = [];
        for (var i = 0; i < hex.length; i++) {
            result.push(parseInt(hex[i], 16));
        };
        return result;
    },

    getPaddedLenBuf: function(text, len) {
        var outputTextBuf = new Buffer(len);
        outputTextBuf.fill(0x20);

        var textBuf = (new Buffer(text, 'utf-8')).slice(0, len);

        // copy to the new padded buffer
        textBuf.copy(outputTextBuf);

        return outputTextBuf;
    },

    compareify: function(src, dst, msg) {
        var r = Buffer.concat([new Buffer.from([parseInt(src, 16), parseInt(dst, 16)]), msg]);

        //console.log(r, '/', src , '/', dst, '/', msg);

        return r;
    },

    isEq: function(op1, op2) {
        return op1.equals(op2);
    },

    //Convert data to hex and compare with message
    compare: function(data, message) {
        var b1 = Buffer.concat([new Buffer.from([parseInt(data.src, 16), parseInt(data.dst, 16)]), data.msg]);
        var b2 = Buffer.concat([new Buffer.from([message.src, message.dst]), message.msg]);
        return b1.equals(b2);
    },

    //Compare only messages data
    compareMsg: function(data, message) {
        return data.msg.equals(message.msg);
    },

    //Compare only messages data
    startsWith: function(data, message) {
        var b1 = data.msg;
        var b2 = message.msg;
        var valid = true;
        for (var i = 0; i < b2.length; i++) {
            if (b1[i] != b2[i]) {
                return false;
            }
        };

        return true;
    },

    //Compare only messages data
    endsWith: function(data, message) {
        var b1 = data.msg;
        var b2 = message.msg;
        var valid = true;
        for (var i = 0; i < b2.length; i++) {
            if (b1[b1.length - i] != b2[b2.length - i]) {
                return false;
            }
        };

        return true;
    },

    intToAscii: function(array) {
        if (!array)
            return "";
        var result = "";
        for (var i = 0; i <= array.length - 1; i++) {
            var val = array[i];
            if (val > 19 && val < 127) {
                result += String.fromCharCode(val);
            } else {
                result += ".";
            }
        };
        return result;
    },

    asciiToHex: function(string) {
        if (!this)
            return [];
        var input = this;
        var result = [];
        for (a = 0; a <= input.length - 1; a++) {
            result.push(input.charCodeAt(a).toString(16));
        }
        return result;
    },

    logIbusPacket: function(pkt) {
        for (const [key, value] of Object.entries(msgs.messages)) {
            if (this.compareMsg(pkt, value)) {
                if (parseInt(pkt.src, 16) == value.src && parseInt(pkt.dst, 16) == value.dst) {
                    log.info(clc.yellow(`Received ${key}`));
                }
            }
        }
        log.info(`[IbusPacket] Id: 	        ${pkt.id}`);
        log.info(`[IbusPacket] From: 	        ${IbusDevices.getDeviceName(pkt.src)}`);
        log.info(`[IbusPacket] To: 	        ${IbusDevices.getDeviceName(pkt.dst)}`);
        log.info(`[IbusPacket] Message:          ${pkt.msg}`);
        log.info(clc.yellow(`[IbusPacket] Message (text):   ${pkt.msg.toString()}\n`));
    },

    log
}