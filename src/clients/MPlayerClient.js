var cp = require('child_process');
const log = require("log");
clc = require('cli-color'),
fs = require('fs'),
cp = require('child_process'),
events = require('events'),
readline = require('readline'),
util = require('util'),
EventEmitter = require("events").EventEmitter,
spawn = cp.spawn;

var moduleName = '[MPlayerClient] ';

// Media-player-daemon client
var MPlayerClient = function () {
    // self reference
    var _self = this;
    
    this.childProc = null;
    this.file = "";
    this.rl = null;
    this.mplayerBinary = null;
    
    // exposed data
    this.init = init;
    this.play = play;
    this.pause = pause;
    this.stop = stop;
    this.info = info;
    this.seek = seek;
    this.volumeUp = volumeUp;
    this.volumeDown = volumeDown;
    this.isPaused = isPaused;
    
    if (typeof path !== 'undefined')
        this.setFile(path);
    
    events.EventEmitter.call(this);
    
    // implementation
    function init(opts) {
        log.info('[MPLayerClient] Starting up..');
        this.mplayerBinary = opts.mplayerBinary;
    }
    
    function play(filename) {
        if (!filename) {
            log.error("*** player no file.");
        }
        else {
            _self.file = filename;
            try {
                _self.rl.close();
            } catch (e1) {
                //log.alert("*** player no interface to disconnect ." + e1);
            };
            
            try {
                _self.childProc.kill('SIGTERM');
            } catch (e2) {
                //log.alert("*** player nothing to kill ." + e2);
            };
            try {
                var args = ['-slave', '-quiet', this.file],
                    that = this;
                
                _self.childProc = spawn(this.mplayerBinary, args);
                if (_self.childProc !== null) {
                    log.info("*** player setup " + " ... " + filename);
                }
                
                _self.childProc.on('error', function (error) {
                    log.error("*** player Error " + " ... " + error);
                    that.emit('error');
                });
                
                _self.childProc.on('exit', function (code, sig) {
                    if (code === 0 && sig === null) {
                        log.info("*** player End " + " ... " + sig + '.' + code);
                        that.emit('end');
                    }
                });
                
                _self.rl = readline.createInterface({
                    input: _self.childProc.stdout,
                    output: _self.childProc.stdin
                });
            }
            catch (ex) {
                log.info("retry playing " + " ... " + filename + " - " + ex);
                _self.play(filename);
            }
        }
        log.info("[MPlayerClient] playing " + " ... " + filename);
    }
    
    function pause() {
        if (_self.childProc !== null) {
            _self.childProc.stdin.write('pause\n');
        }
    }

    function stop(hardStop) {
        if (_self.childProc !== null) {
            if (hardStop) {
                _self.childProc.kill('SIGTERM');
                _self.childProc = null;
            } else {
                _self.childProc.stdin.write('stop\n');
            }
        }
    }
    
    function seek(sec) {
        if (_self.childProc !== null) {
            _self.childProc.stdin.write('seek ' + sec + ' 0\n');
        }
    }
    
    
    function info(callback) {
        if (_self.childProc !== null) {
            _self.rl.question("get_time_pos\n", function (answer) {
                if (answer.split('=')[1] !== undefined) {
                    callback(answer.split('=')[1]);
                }
            });
        } else {
            callback(undefined);
        }
    }

    function isPaused(callback) {
        if (_self.childProc !== null && !_self.rl.closed) {
            _self.rl.question("pausing_keep_force get_property pause\n", function (answer) {
                if (answer.split('=').length == 2)
                    if (answer.split('=')[1] === 'yes') callback(true);
                    else callback(false);
            });
        } else {
            callback(false);
        }
    }

    function volumeUp() {
        if(this.childProc !== null){
            this.childProc.stdin.write('volume +10 0\n');
        }
    };

    function volumeDown() {
        if(this.childProc !== null){
            this.childProc.stdin.write('volume -10 0\n');
        }
    };
}

util.inherits(MPlayerClient, EventEmitter);
module.exports = MPlayerClient;
