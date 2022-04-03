const log = require("log");
msgs = require('../messages.js'),
clc = require('cli-color');

var CDChangerDevice = function (ibusInterface) {
    
    // self reference
    var _self = this;
    var announceNeeded = true;
    
    // exposed data
    this.init = init;
    this.deviceName = 'CDChangerDevice';
    this.announceDevice = announceDevice;
    this.respondAsCDplayer = respondAsCDplayer;
    this.sendPlayingXX = sendPlayingXX;

    // implementation
    function init() {
        _self.announceNeeded=true;
        announceDevice();
    }

    function announceDevice() {
        if (_self.announceNeeded) {
            ibusInterface.sendMessage(msgs.messages.cdc_announceCd);
            setTimeout(function () {
                if(_self.announceNeeded){
                    announceDevice();
                }
            }, 3000);
        }
    }
    
    function respondAsCDplayer() {
        ibusInterface.sendMessage(msgs.messages.cdc_respondAsCd);
        _self.announceNeeded=false;
    }
    
    function sendPlayingXX(cdNo, trackNo) {
        var pkt = msgs.messages.cdc_playingXX;
        const append = Buffer.from([cdNo, trackNo]);
        pkt.msg = Buffer.concat([pkt.msg, append]);
        ibusInterface.sendMessage(pkt);
        log.info(clc.yellow(`'CD${cdNo} TR${trackNo}' sent to radio`));
    }

};

module.exports = CDChangerDevice;
