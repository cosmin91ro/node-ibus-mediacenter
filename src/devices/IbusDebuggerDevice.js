const log = require("log"),
clc = require('cli-color'),
_ = require('underscore'),
tools = require('../tools.js'),
msgs = require('../messages.js');

// Debug Ibus messages
var IbusDebuggerDevice = function () {
    
    // self reference
    var _self = this;
    
    // exposed data
    this.init = init;
    this.deviceName = 'Ibus Debugger';
    this.listenDeviceIds = [];
    
    this.radrev = simulateREV;
    this.radff = simulateFF;
    this.rad1 = simulateButton1;
    this.rad2 = simulateButton2;
    this.rad3 = simulateButton3;
    this.rad4 = simulateButton4;
    this.rad5 = simulateButton5;
    this.rad6 = simulateButton6;
    this.radm = simulateM;
    this.mflprev = simulateMflPrev;
    this.mflnext = simulateMflNext;

    this.allMessages = [];
    
    // local data
    this.ibusInterface = {};
    
    // implementation
    function init(ibusInterface, listenDeviceIds, successFn) {
        log.debug('[IbusDebuggerDevice] Starting up..');
        
        // set interfaces
        _self.ibusInterface = ibusInterface;
        _self.listenDeviceIds = listenDeviceIds || [];
        
        //local data
        _self.allMessages = [];
        for (var attributename in msgs.messages) {
            _self.allMessages.push({ key: attributename, value: msgs.messages[attributename] })
        }
        
        // events
        _self.ibusInterface.on('data', onData);
        
        if (successFn) {
            successFn();
        }
    }
    
    function onData(data) {
        if (process.env.LOG_ONLY) {
            if (data.src === process.env.LOG_ONLY || data.dst === process.env.LOG_ONLY) {
                tools.logIbusPacket(data);
            }
        } else {
            tools.logIbusPacket(data);
        }
    }
    
    function findMessage(data) {
        for (var i = 0; i < _self.allMessages.length; i++) {
            if (tools.compare(data, _self.allMessages[i].value)) {
                return _self.allMessages[i];
                break;
            }
        };
        return undefined;
    }
    
    function simulateButton1() {
        //C0 06 68 31 40 00 00 - radio button 1 press
        _self.ibusInterface.sendMessage(msgs.messages.mid_1_press);
    }
    
    function simulateButton2() {
        //C0 06 68 31 40 00 01 - radio button 2 press
        _self.ibusInterface.sendMessage(msgs.messages.mid_2_press);
    }
    
    function simulateButton3() {
        //C0 06 68 31 40 00 02 - radio button 3 press
        _self.ibusInterface.sendMessage(msgs.messages.mid_3_press);
    }
    
    function simulateButton4() {
        _self.ibusInterface.sendMessage(msgs.messages.mid_4_press);
    }
    
    function simulateButton5() {
        //C0 06 68 31 40 00 04 - radio button 5
        _self.ibusInterface.sendMessage(msgs.messages.mid_5_press);
    }
    
    function simulateButton6() {
        //C0 06 68 31 40 00 05 - radio button 6
        _self.ibusInterface.sendMessage(msgs.messages.mid_6_press);
    }

    function simulateREV() {
        //C0 06 68 31 00 00 0C - radio REV press
        _self.ibusInterface.sendMessage(msgs.messages.mid_rev_press);
    }
    
    function simulateFF() {
        //C0 06 68 31 00 00 0C - radio REV press
        _self.ibusInterface.sendMessage(msgs.messages.mid_ff_press);
    }

    function simulateM() {
        //C0 06 68 31 00 00 0E - radio m press
        _self.ibusInterface.sendMessage(msgs.messages.mid_m_press);
    }
    
    function simulateMflPrev() {
        _self.ibusInterface.sendMessage(msgs.messages.previous_press);
    }
    
    function simulateMflNext() {
        _self.ibusInterface.sendMessage(msgs.messages.next_press);
    }
    
}

module.exports = IbusDebuggerDevice;
