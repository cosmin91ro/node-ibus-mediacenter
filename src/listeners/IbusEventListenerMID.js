const log = require("log");
const tools = require("../tools.js");
clc = require('cli-color'),
msgs = require('../messages.js'),
Playlist = require('../media/Playlist.js');
fs = require('fs');
var ibusDevices = require('ibus').IbusDevices;


var IbusEventListenerMID = function (config) {
    
    var _self = this;
    
    this.deviceName = 'IbusEventClientMID';
    this.ibusInterface = {};
    this.cdChangerDevice = {};
    this.midDevice = {};
    this.init = init;
    this.currentListType = {};
    
    function init(ibusInterface, cdcDevice, midDevice, navDisplay) {
        _self.ibusInterface = ibusInterface;
        _self.cdChangerDevice = cdcDevice;
        _self.midDevice = midDevice;
        _self.navDisplay = navDisplay;
        
        _self.title1 = "";
        _self.title2 = "";
        _self.currentPlaylist = new Playlist(config);
        _self.currentPlaylist.init("dir" /*config.currentListType*/);
        
        _self.currentPlaylist.on('statusUpdate', onStatusUpdate)
        
        log.info('[IbusEventListenerMID] Starting up..');
        
        // events
        ibusInterface.on('data', onData);

    }
    
    function onStatusUpdate(data) {
        _self.title1 = data.title1;
        _self.title2 = data.title2;
        log.info(clc.yellow(`Playing ${data.title2} - track ${data.index + 1}`));
        log.info(JSON.stringify(data));
        writeStatus(data);

        _self.navDisplay.setTitle(data.title1);
    }

    function writeStatus(status) {
        const statusFile = 'status';
        const st = `${status.title2}-${status.index + 1}`;
        fs.writeFile(statusFile, st, function (err) {
            if (err) 
                log.error(`Could not save status to file: ${err}`);
            });
        console.info(`Status ${st} written to file`);
    }

    function changeCD(cd) {
        if (_self.currentPlaylist.current.title2 === cd)
            return;
        _self.currentPlaylist.loadPlaylist(null, cd, 1);
        _self.currentPlaylist.play();
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
                if (tools.compare(data, msgs.messages.rad_cdReqPlay)) {

                    _self.currentPlaylist.play();
                    

                } else if (tools.compareMsg(data, msgs.messages.rad_cdPool)) {
                    _self.cdChangerDevice.respondAsCDplayer();
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
                }
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
                    _self.currentPlaylist.currentTime(function (data) {
                        log.info("............." + data);
                    });
                }
            }
        }
        else if (parseInt(data.src, 16) == msgs.devices.mfl) { //From MFL
            if (parseInt(data.dst, 16) == msgs.devices.radio) { //To radio
                if (tools.compareMsg(data, msgs.messages.previous_press)) {
                    _self.currentPlaylist.previous();
                }
                else if (tools.compareMsg(data, msgs.messages.next_press)) {
                    _self.currentPlaylist.next();
                }
            }
        } else if (ibusDevices.getDeviceName(data.src) === 'OnBoardMonitor - f0') {
            if (ibusDevices.getDeviceName(data.dst) === 'Radio - 68') {
                if (tools.compareMsg(data, msgs.messages.volume_up)) {
                   log.debug('volume up ...');
                //    _self.currentPlaylist.mpc.setVolume(100);
                } else if (tools.compareMsg(data, msgs.messages.volume_down)) {
                    log.debug('volume down ...');
                    // _self.currentPlaylist.mpc.setVolume(50);
                }
            }

        }
    }
}

module.exports = IbusEventListenerMID;
