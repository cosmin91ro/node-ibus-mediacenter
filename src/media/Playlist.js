const log = require("log");
const path = require('path');

clc = require('cli-color'),
Config = require('../config.js'),
fs = require('fs'),
mime = require('mime'),
mm = require('musicmetadata'),
MPlayerClient = require('../clients/MPlayerClient.js'),
// MPlayerClient = require('../clients/node-mplayer.js'),
util = require('util'),
EventEmitter = require("events").EventEmitter;

var moduleName = '[Playlist] ';


var Playlist = function (config) {

    // self reference
    var _self = this;

    // exposed data
    this.init = init;
    this.typeName = "";

    //menu navigation
    this.up = up;
    this.down = down;
    this.enter = enter;
    this.back = back;

    this.play = play;
    this.pauseToggle = pauseToggle;
    this.stop = stop;
    this.seek = seek;
    this.currentTime = info;
    this.next = next;
    this.previous = previous;
    this.current = {};
    this.mode = "play"; //play, browse, search
    this.browseCurrent = {};
    this.loadPlaylist = loadPlaylist;
    this.isPaused = isPaused;
    this.totalMiItems = 0;

    // MPlayer Client
    _self.mpc = new MPlayerClient();

    _self.cfg = config;

    //events
    _self.mpc.on('end', onPlayerEnd);

    // local data
    this.items = [];
    this.parsingItems = [];

    // implementation
    function init(type, startItem) {
        _self.current = startItem;
        _self.typeName = type;
        loadFromDisk();
        if (!_self.current) {
            _self.current = getFile();
            if (!_self.current) {
            }
            else {
                log.info(clc.red(_self.current.title1 + " -> " + _self.current.title2));
            }
        }
        _self.browseCurrent = _self.current;
        // mpc client startup
        _self.mpc.init({mplayerBinary: process.argv[4]});
    }

    function onPlayerEnd(data) {
        _self.next();
    }

    function info(callback) {
        return _self.mpc.info(callback);
    }

    function isPaused(callback) {
        return _self.mpc.isPaused(callback);
    }

    function loadFromDisk() {
        var cd = 'CD1';
        var track = 1;
        const statusFile = 'status';
        log.info('Looking for last status ...');
        if (fs.existsSync(statusFile)) {
            var status = fs.readFileSync(statusFile, 'utf-8').replace('\n', '');
            const parts = status.split('-');
            if (parts && parts.length === 2) {
                cd = parts[0];
                track = parseInt(parts[1]);
            }
        } else {
            log.info('Status file not found.');
        }

        if (_self.typeName == "dir") {
            loadPlaylist(null, cd, track);

            _self.parsingItems = JSON.parse(JSON.stringify(_self.items));
            for (var i = _self.parsingItems.length - 1; i >= 0; i--) {
                var mi = _self.parsingItems[i];
            };
            
            for (var i = _self.items.length - 1; i >= 0; i--) {
                addParent(_self.items[i], null);
            };
        }
        else if (_self.typeName == "pls") {

        }
        else if (_self.typeName = "queue") {

        }
    }

    function loadPlaylist(itemPath, cd, track) {
        loadFiles(itemPath, cd, track);
        log.info(clc.blue("Files loaded"));
        log.debug(_self.items);
        if (_self.items.length == 0) {
            log.error('No items here');
        }

        if (!_self.current) {
            _self.current = _self.items[0];
        }
        log.info('Current track:', _self.current);
    }

    function loadFiles(itemPath, cd, track) {
        if (cd)
        log.info(`Loading songs from ${cd}`);
        _self.items = [];
        if (!itemPath) { itemPath = _self.cfg.mediaPath; }

        var d = itemPath.split('/');
        var previousDir = d[d.length - 1];
        var dirsAndFiles = fs.readdirSync(itemPath);
        var counter = 0;

        for (var i = 0; i < dirsAndFiles.length; i++) {
            var currentDirOrFile = dirsAndFiles[i];
            var mi = {
                index: counter,
                title1: currentDirOrFile.replace('.mp3', ''),
                title2: previousDir,
                filename: path.join(itemPath, currentDirOrFile),
                items: [],
                parent: null,
                parsed: false,
            };

            if (cd && currentDirOrFile === cd && fs.lstatSync(mi.filename).isDirectory) {
                loadFiles(mi.filename, null, track);
            }

            var addToList = false;
            var stats = fs.lstatSync(mi.filename);
            if (stats.isFile() && cd == null) {
                var ft = mime.lookup(mi.filename);
                if (ft == 'audio/mpeg' || ft == 'audio/x-ms-wma') {
                    mi.items = null;
                    addToList = true;
                }
            }

            if (addToList) {
                _self.items.push(mi);
                if (track && track === mi.index + 1)
                    _self.current = mi; 
                counter++;
            }
        }
    }

    function rescan() {
        if (_self.typeName == "dir") {
            loadFiles();
        }
        else if (type == "pls") {

        }
        else if (type = "queue") {

        }
    }

    function saveItems(items) {
        fs.writeFileSync("list.txt", JSON.stringify(items));
    }

    function loadItems() {
        var fcontent = fs.readFileSync("list.txt");
        return JSON.parse(fcontent);
    }

    function addParent(item, parentItem) {
        item.parent = parentItem;
        if (item.items !== null && item.items.length > 0) {
            for (var i = item.items.length - 1; i >= 0; i--) {
                addParent(item.items[i], item);
            };
        }
    }

    function clearParent(item) {
        item.parent = null;
        if (item.items !== null && item.items.length > 0) {
            for (var i = item.items.length - 1; i >= 0; i--) {
                clearParent(item.items[i]);
            };
        }
    }

    function _logResultMessage(err, msg) {
        if (err) log.error(moduleName + msg);
        log.info(moduleName + msg);
    }

    function seek(sec) {
        _self.mpc.seek(sec);
    }

    function next() {
        log.info('Looking for next song ...');
        _self.current = getNextItem(_self.current);
        _self.play();
    }

    function previous() {
        log.info('Looking for previous song ...');
        _self.current = getPreviousItem(_self.current);
        _self.play();
    }

    function down() {
        if (!setMode("browse")) {
            browseNext();
            _self.emit('statusUpdate', _self.browseCurrent);
        }
    }

    function up() {
        if (!setMode("browse")) {
            browsePrevious();
            _self.emit('statusUpdate', _self.browseCurrent);
        }
    }

    function enter() {
        if (!setMode("browse")) {
            if (_self.browseCurrent.items != null) {
                _self.browseCurrent = _self.browseCurrent.items[0];
                _self.emit('statusUpdate', _self.browseCurrent);
            }
        }
    }

    function back() {
        if (!setMode("browse")) {
            if (_self.browseCurrent.parent != null) {
                _self.browseCurrent = _self.browseCurrent.parent;
                _self.emit('statusUpdate', _self.browseCurrent);
            }
        }
    }

    //returns true if mode is changed
    function setMode(newMode) {
        if (_self.mode !== newMode) {
            _self.mode = newMode;
            if (!_self.current.parent) {
                _self.browseCurrent = _self.current;
            }
            else {
                _self.browseCurrent = _self.current.parent;
            }
            _self.emit('statusUpdate', _self.browseCurrent);
            return true;
        }
        return false;
    }

    function browseNext() {
        if (!_self.browseCurrent) {
            _self.browseCurrent = _self.current.parent;
        }

        if (!_self.browseCurrent.parent) {
            if (!_self.items[_self.browseCurrent.index + 1]) {
                _self.browseCurrent = _self.items[0];
            }
            else {
                _self.browseCurrent = _self.items[_self.browseCurrent.index + 1];
            }
        }
        else if (!_self.browseCurrent.parent.items[_self.browseCurrent.index + 1]) {
            _self.browseCurrent = _self.browseCurrent.parent.items[0];
            return _self.browseCurrent;
        }
        else {
            _self.browseCurrent = _self.browseCurrent.parent.items[_self.browseCurrent.index + 1];
            return _self.browseCurrent;
        }
    }

    function browsePrevious() {
        if (!_self.browseCurrent) {
            _self.browseCurrent = _self.current.parent;
        }

        if (!_self.browseCurrent.parent) {
            if (!_self.items[_self.browseCurrent.index - 1]) {
                _self.browseCurrent = _self.items[_self.items.length - 1];
            }
            else {
                _self.browseCurrent = _self.items[_self.browseCurrent.index - 1];
            }
        }
        else if (!_self.browseCurrent.parent.items[_self.browseCurrent.index - 1]) {
            _self.browseCurrent = _self.browseCurrent.parent.items[_self.browseCurrent.parent.items.length - 1];
            return _self.browseCurrent;
        }
        else {
            _self.browseCurrent = _self.browseCurrent.parent.items[_self.browseCurrent.index - 1];
            return _self.browseCurrent;
        }
    }

    function getNextItem(mediaItem) {
        var newIndex = mediaItem.index + 1;
        if (mediaItem.index === _self.items.length - 1)
            newIndex = 0;
        return _skip(newIndex);
    }

    function getPreviousItem(mediaItem) {
        var newIndex = mediaItem.index - 1;
        if (mediaItem.index === 0)
            newIndex = _self.items.length - 1;
        return _skip(newIndex);
    }

    function _skip(index) {
        if (_self.items[index]) {
            if (_self.items[index].items) { // next item is a folder
                return getNextItem(_self.items[index]);
            } else {
                return getFile(_self.items[index]);
            }
        };
    }

    function getNextFolder(parentItem, autoFromParent) {
        if (parentItem.parent != null) {
            if (!parentItem.parent.items[parentItem.index + 1]) {
                parentItem = getNextFolder(parentItem.parent, autoFromParent);
            }
            else {
                if (autoFromParent) {
                    parentItem = parentItem.parent.items[parentItem.index + 1];
                }
                else {
                    parentItem = parentItem.parent.items[0];
                }
            }
        }
        else {
            if (!_self.items[parentItem.index + 1]) {
                parentItem = _self.items[0];
            }
            else {
                parentItem = _self.items[parentItem.index + 1];
            }
        }
        return parentItem;
    }

    function getPreviousFolder(parentItem, autoFromParent) {
        if (parentItem.parent != null) {
            if (!parentItem.parent.items[parentItem.index - 1]) {
                parentItem = getPreviousFolder(parentItem.parent, autoFromParent);
            }
            else {
                if (autoFromParent) {
                    parentItem = parentItem.parent.items[parentItem.index - 1];
                }
                else {
                    parentItem = parentItem.parent.items[parentItem.parent.items.length - 1];
                }
            }
        }
        else {
            if (!_self.items[parentItem.index - 1]) {
                parentItem = _self.items[_self.items.length - 1];
            }
            else {
                parentItem = _self.items[parentItem.index - 1];
            }
        }
        return parentItem;
    }

    function getFile(item) {
        if (item == undefined) {
            item = _self.items[0];
        }
        log.info("getFile: " + item.filename);
        if (item.items == null || item.items.length == 0) {
            return item;
        }
        else {
            return getFile(item.items[0]);
        }
    }

    function play() {
        _self.current = getFile(_self.current);
        if (!_self.current) {
            log.error("player: no file" + _self.current);
        }
        else {
            _self.mpc.play(_self.current.filename);
            _self.emit('statusUpdate', _self.current);
        }
    }

    function pauseToggle() {
        _self.mpc.pause();
    }

    function stop(hardStop) {
        _self.mpc.stop(hardStop);
    }

    //slow    
    function updateMetaData(listItem) {
        /* { artist : ['Spor'],
          album : 'Nightlife, Vol 5.',
          albumartist : [ 'Andy C', 'Spor' ],
          title : 'Stronger',
          year : '2010',
          track : { no : 1, of : 44 },
          disk : { no : 1, of : 2 },
          genre : ['Drum & Bass'],
          picture : [ { format : 'jpg', data : <Buffer> } ],
          duration : 302.41 // in seconds 
        }*/
        var ft = mime.lookup(listItem.filename);
        //log.info(clc.yellow(listItem.filename + " " + _self.totalMiItems));
        if (ft == 'audio/mpeg' || ft == 'audio/x-ms-wma') {
            var parser = mm(fs.createReadStream(listItem.filename), function (err, metadata) {
                _self.totalMiItems = _self.totalMiItems - 1;
                if (err) {
                    log.error(clc.red("filename: " + listItem.filename + " " + err));
                    listItem.parsed = true;
                }
                if (metadata.album !== undefined) {
                    listItem.title2 = metadata.album;
                }
                if (metadata.title !== undefined) {
                    listItem.title1 = metadata.title;
                }
                listItem.parsed = true;

                //Save if last item
                if (_self.totalMiItems == 0) {
                    for (var i = _self.items.length - 1; i >= 0; i--) {
                        clearParent(_self.items[i]);
                    };
                    saveItems(_self.items);
                    log.info(clc.red("Saved list."));
                    for (var i = _self.items.length - 1; i >= 0; i--) {
                        addParent(_self.items[i], null);
                    };

                }
                log.info(_self.totalMiItems + " " + listItem.filename);
            });
        }
        if (listItem.items !== null && listItem.items.length > 0) {
            for (var i = listItem.items.length - 1; i >= 0; i--) {
                updateMetaFata(listItem.items[i]);
            };
        }
    }

};
util.inherits(Playlist, EventEmitter);
module.exports = Playlist;
