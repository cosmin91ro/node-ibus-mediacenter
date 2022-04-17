const { log } = require('./tools');
clc = require('cli-color'),
tools = require('./tools.js');

var cluster = require('cluster');

if (cluster.isMaster) {
    cluster.fork();

    cluster.on('exit', function(worker, code, signal) {
        if (code === 0) {
            log.error('Worker ' + worker.id + ' died..');
            cluster.fork();
        } else {
            log.error('Worker ' + worker.id + ' terminated..');
        }
    });
} else {
    if (process.argv.length < 5){
        log.info(`Usage: ${process.argv[0]} ${process.argv[1]} <tty_device> <mediacenter_location> <mplayer_binary> [--handle-volume-commands]`);
        process.exit(-1);
    }

    var Config = require('./config.js');
    var IbusInterface = require('ibus').IbusInterface;
    var CDChangerDevice = require('./devices/CDChangerDevice.js')
    var MidDevice = require('./devices/MidDevice.js');
    var PH7090NavDevice = require('./devices/PH7090NavDevice.js');
    var IbusEventListenerMID = require('./listeners/IbusEventListenerMID.js');
    
    var cfg = new Config(process.argv[5]);
    
    var device = process.argv[2];
    var ibusInterface = new IbusInterface(device);

    //Devices

    // MID Multi Information Display Device
    var midDevice = new MidDevice(ibusInterface);
    
    // CD Changer Device
    var cdcDevice = new CDChangerDevice(ibusInterface);

    // PH7090 Navigation Display
    var navDisplay = new PH7090NavDevice(ibusInterface);

    // Listeners

    // Ibus MID Event Client
    var ibusEventListenerMID = new IbusEventListenerMID(cfg);

    // events
    process.on('SIGINT', onSignalInt);
    process.on('SIGTERM', onSignalTerm);

    // implementation
    function onSignalInt() {
        shutdown(function() {
            process.exit(1);
        });
    }

    function onSignalTerm() {
        log.info('Hard exiting..');
        process.exit(1);
    }

    function startup(successFn) {
        tools.init();
        ibusInterface.startup();

        cdcDevice.init(ibusInterface);
        midDevice.init(ibusInterface);
        navDisplay.init(ibusInterface);

        ibusEventListenerMID.init(ibusInterface, cdcDevice, midDevice, navDisplay);
    }

    function shutdown(successFn) {
        ibusInterface.shutdown(function() {
            successFn();
        });
    }

    // main start
    startup();
}
