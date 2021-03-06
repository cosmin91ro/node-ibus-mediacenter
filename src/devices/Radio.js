const { log } = require('../tools');
msgs = require('../messages.js'),
clc = require('cli-color');
var ibusDevices = require('ibus').IbusDevices;


var Radio = function (ibusInterface) {
    
    // self reference
    var _self = this;
    
    // exposed data
    this.init = init;
    ibusInterface.on('data', onData);

    // implementation
    function init(playlist, config, cdc) {
        _self.currentPlaylist = playlist;
        _self.config = config;
        _self.cdc = cdc;
    }

    function onData(data) {
        if (ibusDevices.getDeviceName(data.dst) != 'Radio - 68') return;
       
        if (tools.compareMsg(data, msgs.messages.volume_up)) {
            if (_self.config.handeVolumeCommands) _self.currentPlaylist.mpc.volumeUp();
            else log.info("Volume commands not handleded");
        } else if (tools.compareMsg(data, msgs.messages.volume_down)) {
            log.debug('volume down ...');
            if (_self.config.handeVolumeCommands)  _self.currentPlaylist.mpc.volumeDown();
            else log.info("Volume commands not handleded");
        } else if (tools.compareMsg(data, msgs.messages.previous_press)) {
            _self.currentPlaylist.previous();
        }
        else if (tools.compareMsg(data, msgs.messages.next_press)) {
            _self.currentPlaylist.next();
        } else if (tools.compareMsg(data, msgs.messages.ph7090_1_press)) {
            _self.cdc.changeCD('CD1');
        } else if (tools.compareMsg(data, msgs.messages.ph7090_2_press)) {
            _self.cdc.changeCD('CD2');
        }
    }
};

module.exports = Radio;
