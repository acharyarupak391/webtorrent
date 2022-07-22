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

function archiveFolder(foldername = "", move = true) {
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
  mv(
    path.join(__dirname, filename),
    path.join(__dirname, "server", "public", "files", filename),
    { mkdirp: true },
    function (err) {
      // done. it first created all the necessary directories, and then
      // tried fs.rename, then falls back to using ncp to copy the dir
      // to dest and then rimraf to remove the source dir

      if (err) console.log("Error in moving: ", err);
      else console.log("moved to downloads");
    }
  );
}

function deleteFolder(foldername) {
  rimraf(path.join(__dirname, foldername), function () {
    console.log(foldername, " deleted");
  });
}

// get list of files in a directory
function getFiles(dir) {
  const files = [];
  fs.readdirSync(dir).forEach((file) => {
    files.push(file);
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
};
