var fs = require("fs");
var archiver = require("archiver");
var path = require("path");

var archive = archiver("zip");

var mv = require("mv");

var rimraf = require("rimraf");

// append files from a sub-directory, putting its contents at the root of archive
// archive.directory(source_dir, false);

const getSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const getSpeed = (speedInBytes) => getSize(speedInBytes) + "/s";

const getTimeInterval = (seconds) => {
  const _seconds = Math.floor(seconds);
  if (_seconds < 60) return `${_seconds} seconds`;
  if (_seconds < 60 * 60) {
    const minutes = Math.floor(_seconds / 60);
    const secondsLeft = _seconds - minutes * 60;
    return `${minutes} minutes ${secondsLeft} seconds`;
  } else {
    const hours = Math.floor(_seconds / 60 / 60);
    const minutesLeft = Math.floor((_seconds - hours * 60 * 60) / 60);
    return `${hours} hours ${minutesLeft} minutes`;
  }
};

function archiveFolder(foldername = "", move = true) {
  console.log("Archiving...");
  let archiveName = foldername.endsWith("/")
    ? foldername.substring(0, foldername.length - 1)
    : foldername;
  archiveName = `${archiveName}.zip`;

  var output = fs.createWriteStream(path.join(__dirname, archiveName));

  output.on("close", function () {
    console.log("Archive Successful: ", getSize(archive.pointer()));
    if (move) moveToFolder(archiveName);
    deleteFolder(foldername);
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(output);

  archive.directory(path.join(__dirname, foldername), foldername);

  archive.finalize();
}

function moveToFolder(filename) {
  const folderToMove = path.join(__dirname, "server", "public", "files");
  mv(
    path.join(__dirname, filename),
    path.join(folderToMove, filename),
    { mkdirp: true },
    function (err) {
      if (err) console.log("Error in moving: ", err);
      else console.log("moved to folder: ", folderToMove);
    }
  );
}

function deleteFolder(foldername) {
  rimraf(path.join(__dirname, foldername), function () {
    console.log(foldername, "deleted");
    process.exit();
  });
}

function getReadableFileSize(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = getSize(stats.size);
  return fileSizeInBytes;
}

// get list of files in a directory
function getFiles(dir) {
  const files = [];
  fs.readdirSync(dir).forEach((file) => {
    const size = getReadableFileSize(path.join(dir, file));
    files.push({ name: file, size });
  });
  return files;
}

if (process.argv.includes("--archive")) {
  const pos = process.argv.indexOf("--archive");
  const _foldername = process.argv[pos + 1];
  if (_foldername) archiveFolder(_foldername);
}

module.exports = {
  archiveFolder,
  moveToFolder,
  getSize,
  getSpeed,
  getFiles,
  getTimeInterval,
};
