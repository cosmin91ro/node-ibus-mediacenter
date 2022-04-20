const { log } = require('./../tools');
msgs = require('../messages.js'),
clc = require('cli-color');

var CDChangerDevice = function (ibusInterface) {
    
    // self reference
    var _self = this;
    var announceNeeded = true;
    
    // exposed data
    this.init = init;
    this.announceDevice = announceDevice;
    this.respondAsCDplayer = respondAsCDplayer;
    this.sendPlayingXX = sendPlayingXX;
    this.sendPlaying0101 = sendPlaying0101;
    this.changeCD = changeCD;

    ibusInterface.on('data', onData);

    // implementation
    function init(navDisplay, playlist) {
        _self.announceNeeded=true;
        announceDevice();      
        _self.navDisplay = navDisplay;
        _self.currentPlaylist = playlist;
    }

    function announceDevice() {
        if (_self.announceNeeded) {
            ibusInterface.sendMessage(msgs.messages.cdc_announceCd);
            if (_self.currentPlaylist && _self.currentPlaylist.current)
                _self.navDisplay.setTitle(_self.currentPlaylist.current.title1);
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

    function sendPlaying0101() {
        ibusInterface.sendMessage(msgs.messages.cdc_playingXX);
        log.info(clc.yellow(`'CD TR' sent to radio`));
    }
    
    function sendPlayingXX(cdNo, trackNo) {
        var pkt = msgs.messages.cdc_playingXX;
        const append = Buffer.from([cdNo, trackNo]);
        pkt.msg = Buffer.concat([pkt.msg, append]);
        ibusInterface.sendMessage(pkt);
        log.info(clc.yellow(`'CD${cdNo} TR${trackNo}' sent to radio`));
    }

    function onData(data) {
        if (parseInt(data.dst, 16) != msgs.devices.cd_changer) return;

        if (tools.compare(data, msgs.messages.rad_cdReqPlay)) {
            _self.currentPlaylist.currentTime(function (time) {
                if (!time) _self.currentPlaylist.play();
                else {
                    _self.currentPlaylist.isPaused(function (isPaused){
                        if (isPaused) _self.currentPlaylist.pauseToggle();
                    });
                }
            });
        } else if (tools.compareMsg(data, msgs.messages.rad_cdPool)) {
            _self.respondAsCDplayer();
        } else if (tools.compareMsg(data, msgs.messages.ph7090_arrow_left)) {
            _self.currentPlaylist.previous();
        } else if (tools.compareMsg(data, msgs.messages.ph7090_arrow_right)) {
            _self.currentPlaylist.next();
        } else if (tools.compareMsg(data, msgs.messages.ph7090_1_press)) {
            changeCD('CD1');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_2_press)) {
            changeCD('CD2');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_3_press)) {
            changeCD('CD3');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_4_press)) {
            changeCD('CD4');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_5_press)) {
            changeCD('CD5');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_6_press)) {
            changeCD('CD6');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_mode_radio)) {
            _self.currentPlaylist.isPaused(function (isPaused) {
                if (!isPaused) _self.currentPlaylist.stop(true);
            });
        }
    }

    function changeCD(cd) {
        // saving current CD to rollback in case the new cd is not found
        var currentCD = null;
        var currentTrack = null;
        if (_self.currentPlaylist && 
            _self.currentPlaylist.current &&
            _self.currentPlaylist.current.title2) {
                currentCD = _self.currentPlaylist.current.title2
                currentTrack = _self.currentPlaylist.current.index + 1;
            }
        if (_self.currentPlaylist.current.title2 === cd)
            return;

        _self.currentPlaylist.loadPlaylist(null, cd, 1);
        
        if (_self.currentPlaylist.items.length > 0) _self.currentPlaylist.play();
        else {
            _self.currentPlaylist.emit('statusUpdate', {title2: 'NODISC'});
            _self.currentPlaylist.loadPlaylist(null, currentCD, currentTrack);
        }
    }
};

module.exports = CDChangerDevice;
