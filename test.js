const cliProgress = require('cli-progress');
const fs = require('fs')

// create new container
const multibar = new cliProgress.MultiBar({
    format: "a[\u001b[32m{bar}\u001b[0m] {percentage}% | {value}/{total} | {duration}",
    clearOnComplete: false,
    hideCursor: true,
    // barGlue: '\u001b[0m'
}, cliProgress.Presets.shades_classic);

const singleBar = new cliProgress.SingleBar({
    format: "Hello\n\u001b[32m{bar}\u001b[0m {percentage}% | {value}/{total} | {duration}\n",
    clearOnComplete: false,
    hideCursor: true,
}, cliProgress.Presets.shades_classic)

console.log('before starting: ', singleBar);
singleBar.start(100, 4);
console.log('after starting: ', singleBar);

// add bars
// const b1 = multibar.create(200, 0);
// const b2 = multibar.create(1000, 0);


// control bars
// b1.increment(24);
// b2.increment(100);

// b2.update(20, {filename: "helloworld.txt"});

// stop all bars
multibar.stop();
singleBar.stop();
