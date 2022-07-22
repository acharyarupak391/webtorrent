const fs = require('fs');
const path = require('path')
const WebTorrent = require("webtorrent");

const cliProgress = require('cli-progress');

// var file = fs.statSync(path.join(__dirname, "Kool & The Gang - Ladies' Night (1979 - R&B) [Flac 16-44]", "05. Kool & The Gang - Tonight's The Night.flac"));
// console.log((file.size / (1024 * 1024)).toFixed(2))

const t1 = new Date().getTime();

const client = new WebTorrent();
const magnetURI = 'magnet:?xt=urn:btih:0B4A63C5807F8B625A36A39E0F672F1B9B352BEE&dn=Platoon+%281986%29+%5B1080p%5D+%5BYTS.MX%5D&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fp4p.arenabg.ch%3A1337&tr=udp%3A%2F%2Ftracker.internetwarriors.net%3A1337'

// taking magnetURI from command line argument
const magnet = process.argv[2];

// using a .torrent file
// const torrentFileName = "[limetorrents.pro]Free.Guy.2021.720p.HDCAM.torrent";
// const torrentFileBuffer = fs.readFileSync(path.join(__dirname, torrentFileName));

client.on('error', (e) => {
  console.log('error: ', e.message)
})

client.add(magnet, function (torrent) {
  console.log('Client is downloading:', torrent.infoHash)
  const totalFiles = torrent.files?.length;
  // console.log(torrent.length)

  const dirName = path.join(__dirname, torrent.name);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }

  let downloaded = 0;
  let _t = t1;

  // progress bar
  
  const singleBar = new cliProgress.SingleBar({
      format: "\n\u001b[32m{bar}\u001b[0m {percentage}% | {value}/{total}\n",
      clearOnComplete: false,
      hideCursor: true,
  }, cliProgress.Presets.shades_classic)
  // singleBar.start(torrent.length, 0);

  torrent.files.forEach(function (file, i) {
    console.log(i + 1, file.name, file.length);

    const readStream = file.createReadStream();
    const writeStream = fs.createWriteStream(path.join(dirName, file.name));

    readStream.on('data', buffer => {
      if(!singleBar.isActive) singleBar.start(torrent.length, 0);
      singleBar.update(torrent.downloaded)
      writeStream.write(buffer);

      // console.log(client.progress)
      // console.log(`downloaded: (${i})`, file.downloaded, file.progress);
    })

    readStream.on('end', () => {
      const t2 = new Date().getTime();
      let _diff = ((t2 - _t) / (1000 * 60)).toFixed(2);
      downloaded += 1;
      console.log(`\n${file.name} [${(file.length / (1024 * 1024)).toFixed(2)} MB]`);
      console.log(`\tDownloaded...  [${downloaded} out of ${totalFiles}] (${_diff} min)`);

      if (downloaded === totalFiles) {
        singleBar.stop();
        let diff = ((t2 - t1) / (1000 * 60)).toFixed(2);
        console.log(`\n_________ Download Complete _________ [${diff} min]`);
        client.destroy();
        readStream.destroy();
        writeStream.destroy();
      }
      _t = t2;
    })

    /*
    readStream.pipe(writeStream);

    readStream.on('end', () => {
      console.log('stream ended');
      client.destroy();
      readStream.destroy();
      writeStream.destroy();
    })
    */

  })
})

// client.add(magnetURI, { path: __dirname}, function (torrent) {
//   torrent.on('done', function () {
//     console.log('torrent download finished')
//   })
// })
