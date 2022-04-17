const { log } = require('./../tools');
msgs = require('../messages.js'),
clc = require('cli-color');

var LightControlModule = function (ibusInterface) {
    
    // self reference
    var _self = this;
    
    // exposed data
    this.init = init;
    ibusInterface.on('data', onData);

    // implementation
    function init(playlist) {
        _self.currentPlaylist = playlist;
    }

    function onData(data) {
        if (parseInt(data.dst, 16) != msgs.devices.lcm) return;
       
        if (tools.compareMsg(data, msgs.messages.key_turn_off)) {
            _self.currentPlaylist.stop(true);
        }
    }
};

module.exports = LightControlModule;
