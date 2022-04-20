const { log } = require('./../tools');
const tools = require("../tools");
clc = require('cli-color'),
msgs = require('../messages.js'),
Playlist = require('../media/Playlist.js');
fs = require('fs');
var ibusDevices = require('ibus').IbusDevices;


var IbusEventListenerMID = function (config) {
    
    var _self = this;
    this.config = config;
    this.deviceName = 'IbusEventListenerMID';
    this.ibusInterface = {};
    this.cdChangerDevice = {};
    this.midDevice = {};
    this.init = init;
    this.currentListType = {};
    
    function init(ibusInterface, cdcDevice, midDevice, navDisplay) {
        _self.ibusInterface = ibusInterface;
        _self.cdChangerDevice = cdcDevice;
        _self.midDevice = midDevice;
        
        _self.title1 = "";
        _self.title2 = "";
        _self.currentPlaylist = new Playlist(config);
        _self.currentPlaylist.init("dir" /*config.currentListType*/);
        
        _self.currentPlaylist.on('statusUpdate', onStatusUpdate)
        
        log.info('[IbusEventListenerMID] Starting up..');
        
        // events
        ibusInterface.on('data', onData);
    }
    
    function onData(data) {
        if (process.env.LOG_ONLY) {
            if (data.src === process.env.LOG_ONLY || data.dst === process.env.LOG_ONLY) {
                tools.logIbusPacket(data);
            }
        } else {
            tools.logIbusPacket(data);
        }
        
        if (parseInt(data.src, 16) == msgs.devices.radio) { //From radio
            if (parseInt(data.dst, 16) == msgs.devices.cd_changer) { //To CD changer
                // Handled in DCChangerDevice.js
            }
            else if (parseInt(data.dst, 16) == msgs.devices.mid) { //To MID
                if (tools.startsWith(data, msgs.messageParts.mid_buttons_for_replaceStart) 
                        && tools.endsWith(data, msgs.messageParts.mid_buttons_for_replaceEnd)) {
                    _self.midDevice.showMp3Menu();
                }
                else if (tools.compareMsg(data, msgs.messages.replace_rad2mid_CD0101)) {
                    log.info("title: " + _self.title1 + ' ' + _self.title2);
                    _self.midDevice.setTitle1(_self.title1);
                    _self.midDevice.setTitle2(_self.title2);
                }
                else if (tools.compareMsg(data, msgs.messages.replace_rad2midCDbuttons)) {
                    _self.midDevice.showMenu1();
                }
            } else if (ibusDevices.getDeviceName(data.dst) === 'OnBoardMonitor - f0') {
                // Handled in OnBoardMonitor.js
            }
        }
        else if (parseInt(data.src, 16) == msgs.devices.mid) { //From MID
            if (parseInt(data.dst, 16) == msgs.devices.radio) { //To radio
                if (tools.compareMsg(data, msgs.messages.mid_1_press)) {
                    _self.currentPlaylist.up();
                }
                else if (tools.compareMsg(data, msgs.messages.mid_2_press)) {
                    _self.currentPlaylist.down();
                }
                else if (tools.compareMsg(data, msgs.messages.mid_3_press)) {
                    _self.currentPlaylist.enter();
                }
                else if (tools.compareMsg(data, msgs.messages.mid_4_press)) {
                    _self.currentPlaylist.back();
                }
                else if (tools.compareMsg(data, msgs.messages.mid_5_press)) {
                    _self.currentPlaylist.current = _self.currentPlaylist.browseCurrent;
                    _self.currentPlaylist.mode = "play";
                    _self.currentPlaylist.play();
                }
                else if (tools.compareMsg(data, msgs.messages.mid_6_press)) {
                    _self.currentPlaylist.queue(_self.currentPlaylist.browseCurrent);
                }
                else if (tools.compareMsg(data, msgs.messages.mid_rev_press)) {
                    _self.currentPlaylist.seek(-10);
                }
                else if (tools.compareMsg(data, msgs.messages.mid_ff_press)) {
                    _self.currentPlaylist.seek(10);
                }
                else if (tools.compareMsg(data, msgs.messages.mid_m_press)) {
                    _self.currentPlaylist.songProgress(function (data) {
                        log.info("............." + data);
                    });
                }
            }
        }
        else if (parseInt(data.src, 16) == msgs.devices.mfl) { //From MFL
            if (parseInt(data.dst, 16) == msgs.devices.radio) { //To radio
                // Handled in Radio.js
            }
        } else if (ibusDevices.getDeviceName(data.src) === 'OnBoardMonitor - f0') {
            if (ibusDevices.getDeviceName(data.dst) === 'Radio - 68') {
                // Handled in Radio.js
            }
        } else if (ibusDevices.getDeviceName(data.src) === 'InstrumentClusterElectronics - 80') {
            if (ibusDevices.getDeviceName(data.dst) === 'LightControlModule - bf') {
                // Handled in LightControlModule.js
            }
        }
    }
}

module.exports = IbusEventListenerMID;
