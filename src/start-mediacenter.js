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

    const Config = require('./config.js');
    const IbusInterface = require('ibus').IbusInterface;
    const Playlist = require('./media/Playlist');
    const IbusDebuggerDevice = require('./devices/IbusDebuggerDevice');
    const CDChangerDevice = require('./devices/CDChangerDevice.js')
    const PH7090NavDevice = require('./devices/PH7090NavDevice.js');
    const LightControlModule = require('./devices/LightControlModule');
    const OnBoardMonitor = require('./devices/OnBoardMonitor');
    const Radio = require('./devices/Radio');
    
    var cfg = new Config(process.argv[5]);
    
    var device = process.argv[2];
    var ibusInterface = new IbusInterface(device);

    var ibusDebuggerDevice = new IbusDebuggerDevice();
    var cdcDevice = new CDChangerDevice(ibusInterface);
    var navDisplay = new PH7090NavDevice(ibusInterface);
    var lcm = new LightControlModule(ibusInterface);
    var obm = new OnBoardMonitor(ibusInterface);
    var radio = new Radio(ibusInterface);

    process.on('SIGINT', onSignalInt);
    process.on('SIGTERM', onSignalTerm);

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
        ibusInterface.startup();

        playlist = new Playlist(cfg);
        playlist.init("dir");
        playlist.on('statusUpdate', onStatusUpdate);

        ibusDebuggerDevice.init(ibusInterface);
        cdcDevice.init(navDisplay, playlist);
        lcm.init(playlist);
        obm.init(playlist);
        radio.init(playlist, cfg, cdcDevice);
        navDisplay.init(ibusInterface);
    }

    function shutdown(successFn) {
        ibusInterface.shutdown(function() {
            successFn();
        });
    }

    function onStatusUpdate(data) {
        log.info(clc.yellow(`Playing ${data.title2} - track ${data.index + 1}`));
        log.info(JSON.stringify(data));
        writeStatus(data);

        navDisplay.setTitle(data.title1);
    }

    function writeStatus(status) {
        const statusFile = 'status';
        const st = `${status.title2}-${status.index + 1}`;
        fs.writeFile(statusFile, st, function (err) {
            if (err) 
                log.error(`Could not save status to file: ${err}`);
            });
        log.info(`Status ${st} written to file`);
    }

    // main start
    startup();
}
