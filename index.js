const fs = require("fs");
const path = require("path");
const WebTorrent = require("webtorrent");

const cliProgress = require("cli-progress");
const { getSize, getSpeed, archiveFolder, getTimeInterval, moveToServer } = require("./utils");

const t1 = new Date().getTime();

const client = new WebTorrent();

// taking magnetURI from command line argument
const magnet = process.argv[2];

// using a .torrent file
// const torrentFileName = "[limetorrents.pro]Free.Guy.2021.720p.HDCAM.torrent";
// const torrentFileBuffer = fs.readFileSync(path.join(__dirname, torrentFileName));

client.on("error", (e) => {
  console.log("error: ", e.message);
});

client.add(magnet, function (torrent) {
  console.log("Client is downloading:", torrent.infoHash);
  const totalFiles = torrent.files?.length;
  // console.log(torrent.length)

  const dirName = path.join(__dirname, torrent.name);
  if (!fs.existsSync(dirName)) {
    fs.mkdirSync(dirName);
  }

  let downloaded = 0;
  let _t = t1;

  // progress bar

  const singleBar = new cliProgress.SingleBar(
    {
      format:
        "\n\u001b[32m{bar}\u001b[0m {percentage}% | {downloaded}/{totalSize} | {speed}\n",
      clearOnComplete: false,
      hideCursor: true,
    },
    cliProgress.Presets.shades_classic
  );
  // singleBar.start(torrent.length, 0);

  torrent.files.forEach(function (file, i) {
    console.log(i + 1, file.name, getSize(file.length));

    const readStream = file.createReadStream();
    const writeStream = fs.createWriteStream(path.join(dirName, file.name));

    if (!singleBar.isActive) {
      singleBar.start(torrent.length, 0, {
        speed: "N/A",
        downloaded: "0 B",
        totalSize: getSize(torrent.length),
      });
    }
    readStream.on("data", (buffer) => {
      singleBar.update(torrent.downloaded, {
        speed: getSpeed(client.downloadSpeed),
        downloaded: getSize(torrent.downloaded),
        totalSize: getSize(torrent.length),
      });
      writeStream.write(buffer);
    });

    readStream.on("end", () => {
      const t2 = new Date().getTime();
      // let _diff = ((t2 - _t) / (1000 * 60)).toFixed(2);
      downloaded += 1;
      // console.log(
      //   `\n${file.name} [${(file.length / (1024 * 1024)).toFixed(2)} MB]`
      // );
      // console.log(
      //   `\tDownloaded...  [${downloaded} out of ${totalFiles}] (${_diff} min)`
      // );

      if (downloaded === totalFiles) {
        singleBar.stop();
        let diff = getTimeInterval((t2 - t1) / 1000);
        console.clear();
        console.log(`\n_________ Download Complete _________\n ${getSize(torrent.length)} [${diff}]`);
        client.destroy();
        readStream.destroy();
        writeStream.destroy();

        if (process.argv.includes("--archive")) archiveFolder(torrent.name);
        else if(process.argv.includes("--move-to-server")) moveToServer(torrent.name);
        else process.exit();
        
      }
      _t = t2;
    });

    /*
    readStream.pipe(writeStream);

    readStream.on('end', () => {
      console.log('stream ended');
      client.destroy();
      readStream.destroy();
      writeStream.destroy();
    })
    */
  });
});

// client.add(magnetURI, { path: __dirname}, function (torrent) {
//   torrent.on('done', function () {
//     console.log('torrent download finished')
//   })
// })
