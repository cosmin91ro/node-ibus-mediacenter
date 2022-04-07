const msgs = require('../messages.js');
const readline = require('readline');
const ibusWriter = require('ibus');
const IbusInterface = require('ibus').IbusInterface

var ibusInterface = new IbusInterface(process.argv[2]);
ibusInterface.startup();

process.on('SIGINT', onSignalInt);

// implementation
function onSignalInt() {
    ibusInterface.shutdown(function() {
        process.exit();
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

console.log('\nThis is meant to emulate radio buttons.\n');
console.log('\nWhich message to send?\n');

var i = 1;
for (const [key, value] of Object.entries(msgs.messages)) {
    console.log(`${i}) ${key}`);
    i++;
}

function prompt() {
    rl.question('Enter message number: ', function (i) {
        console.log(`You selected ${Object.keys(msgs.messages)[i-1]}`);

        packet = Object.values(msgs.messages)[i-1];
        ibusInterface.sendMessage(packet);

        prompt();
    });
};

prompt();