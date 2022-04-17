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
    var IbusDevices = require('ibus').IbusDevices;

    var CDChangerDevice = require('./devices/CDChangerDevice.js')
    var MidDevice = require('./devices/MidDevice.js');
    var IkeDevice = require('./devices/IkeDevice.js');
    var IbusDebuggerDevice = require('./devices/IbusDebuggerDevice.js');
    var PH7090NavDevice = require('./devices/PH7090NavDevice.js');

    var IbusEventListenerMID = require('./listeners/IbusEventListenerMID.js');
    
    var cfg = new Config(process.argv[5]);
    
    // config
    var device = process.argv[2];
    
    // communication interface
    var ibusInterface = new IbusInterface(device);

    // Ibus debugger
    var ibusDebuggerDevice = new IbusDebuggerDevice();

    // MID Multi Information Display Device
    var midDevice = new MidDevice(ibusInterface);
    
    // CD Changer Device
    var cdcDevice = new CDChangerDevice(ibusInterface);
    
    // IKE Instrument Cluster Electronics Device
    var ikeDevice = new IkeDevice(ibusInterface);
    
    // Ibus MID Event Client
    var ibusEventClientMID = new IbusEventListenerMID(cfg);

    var navDisplay = new PH7090NavDevice(ibusInterface);

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

    var isShuttingDown = false;

    function onUncaughtException(err) {

        log.error('[exception-handler] caught: ', err);
        log.alert('Node NOT exiting...');
    }

    function startup(successFn) {
        tools.init();
        // init ibus serial interface
        ibusInterface.startup();

        // ibus debugger
        ibusDebuggerDevice.init(ibusInterface); //, ['18', '68', '0c']);

        cdcDevice.init(ibusInterface);
        ikeDevice.init(ibusInterface);
        midDevice.init(ibusInterface);

        // init mid event client
        ibusEventClientMID.init(ibusInterface, cdcDevice, midDevice, navDisplay);
    }

    function shutdown(successFn) {
        ibusInterface.shutdown(function() {
            successFn();
        });
    }

    // main start
    startup();
}
