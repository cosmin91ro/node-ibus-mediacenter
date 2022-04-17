const { log } = require('../tools');
msgs = require('../messages.js'),
clc = require('cli-color');
var ibusDevices = require('ibus').IbusDevices;


var OnBoardMonitor = function (ibusInterface) {
    
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
        if (ibusDevices.getDeviceName(data.dst) != 'OnBoardMonitor - f0') return;
       
        if (tools.compareMsg(data, msgs.messages.pause)) {
            _self.currentPlaylist.isPaused(function (isPaused) {
                if (!isPaused) _self.currentPlaylist.pauseToggle();
            });
        } else if (tools.compareMsg(data, msgs.messages.unpause)){
            _self.currentPlaylist.isPaused(function (isPaused) {
                if (isPaused) _self.currentPlaylist.pauseToggle();
            });
        }
    }
};

module.exports = OnBoardMonitor;
