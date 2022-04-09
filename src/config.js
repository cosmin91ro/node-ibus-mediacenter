var fs = require('fs');

module.exports = function (handeVolumeCommands) {
    return new config(handeVolumeCommands);
}

function config(handeVolumeCommands) {
    var _self = this;
    var filename = "./config.json";
    // Private state variables
    var cfg = {};
    var saved = "";

    _self.handeVolumeCommands = handeVolumeCommands === '--handle-volume-commands';
    
    try {
        saved = fs.re.readFileSync(filename)
        JSON.parse(saved, cfg);
    }
    catch (ex) {
        cfg = {
            mediaPath: process.argv[3],
            currentListType: "dir",
            dirCurrent: {},
            plsCurrent: {},
            queCurrent: {},
            handeVolumeCommands: handeVolumeCommands === '--handle-volume-commands'
        };
        fs.writeFile(filename, JSON.stringify(cfg), function(err, result) {
            if(err) console.log('error', err);
          });
    }
    
    // Public method
    _self.saveSettings = function () {
        fs.writeFile(filename, JSON.stringify(cfg));
    };
    
    _self.mediaPath = cfg.mediaPath;
}