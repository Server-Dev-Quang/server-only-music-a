const ytdl = require("ytdl-core");
const stream = require("youtube-audio-stream");
const fs = require("fs");
const path = require("path");
const convertAudio = require("../convert");
const urlBase = "http://youtube.com/watch?v=";

const mapCheckInQueueLoading = new Map();
const historyCheck = new Map();
const mapError = new Map();
const arrPathDownloader = [];
const urlAudio = "";

const deleteFile = (musicId, f) => {
  const pathMusic = path.join(__dirname, "..", "musics", `${musicId}.${f}`);
  if (fs.existsSync(pathMusic))
    fs.unlink(pathMusic, (error) => {
      if (error) {
        console.log("has error while delete " + musicId + "." + f);
        mapError.set(`${musicId}.${f} ${Date.now()}`, true);
      } else console.log("deleted " + musicId + "." + f);
    });
};

const deleteAllFile = () => {
  arrPathDownloader.forEach((e) => {
    deleteFile(e.musicId, "mp3");
    deleteFile(e.musicId, e.format);
  });
  if (arrPathDownloader.length > 512)
    arrPathDownloader = [arrPathDownloader.at(-1)];
};

module.exports.getStreamAudioMp3 = (req, res, next) => {
  console.log("in getStreamAudioMp3");
  const musicPath = req.params.musicPath;
  const musicId = req.params.musicPath.split(".")[0];
  console.log(musicPath);

  const stream = ytdl(`https://www.youtube.com/watch?v=${musicId}`, {
    filter: "audioonly",
    quality: "highestaudio",
  });

  res.set({
    "Content-Type": "audio/mpeg",
    "Transfer-Encoding": "chunked",
  });

  stream.pipe(res);
  stream.on("end", () => {
    stream.destroy();
    console.log("end");
  });
};

module.exports.getConvertAudio = (req, res, next) => {
  console.log("in getConvertAudio");
  const startTime = Date.now();
  const musicPath = req.params.musicPath;
  const musicId = req.params.musicPath.split(".")[0];
  const format = req.params.musicPath.split(".")[1];
  const keep = req.query.keep;
  // LISTEN of DOWNLOAD
  const type = req.query.type || "LISTEN";
  console.log(musicPath);

  // nếu musicPath đang load thì trả về đang load
  if (mapCheckInQueueLoading.has(musicPath))
    return res.send({
      result: {
        time: (Date.now() - startTime) / 1000,
        message: "same music path in queue, please recheck later",
        warning: true,
        url: `${urlAudio}/musics/${musicPath}`,
      },
    });

  if (fs.existsSync(path.join(__dirname, "..", "musics", musicPath)))
    return res.send({
      result: {
        time: (Date.now() - startTime) / 1000,
        timeConvert: 0,
        message: "converted",
        url: `${urlAudio}/musics/${musicPath}`,
      },
    });

  mapCheckInQueueLoading.set(musicPath, true);

  // delete file
  if (!keep) deleteAllFile();
  else console.log("keep");

  const stream = ytdl(`https://www.youtube.com/watch?v=${musicId}`, {
    filter: "audioonly",
    quality: "highestaudio",
  });

  stream.pipe(
    fs.createWriteStream(path.join(__dirname, "..", "musics", musicId + ".mp3"))
  );

  stream.on("error", (err) => {
    mapCheckInQueueLoading.delete(musicPath);
    console.log(err);
  });

  // sau khi stream hoàn thành thì chuyển đổi sang dạng tương ứng
  stream.on("end", () => {
    console.log("end download");
    const startConvert = Date.now();
    stream.destroy();

    // hàm đổi định dạng âm thanh
    convertAudio(musicId + ".mp3", musicPath, (err) => {
      mapCheckInQueueLoading.delete(musicPath);
      if (err)
        return res.send({
          error: { err, time: (Date.now() - startTime) / 1000 },
        });
      // thêm path vào, để xóa file mp3 và xóa old file
      arrPathDownloader.push({ musicId, format, type, time: Date.now() });

      historyCheck.set(format, [
        ...(historyCheck.get(format) || []),
        {
          time: (Date.now() - startTime) / 1000,
          timeConvert: (Date.now() - startConvert) / 1000,
          musicId,
        },
      ]);

      res.send({
        result: {
          time: (Date.now() - startTime) / 1000,
          timeConvert: (Date.now() - startConvert) / 1000,
          message: "converted",
          url: `${urlAudio}/musics/${musicPath}`,
        },
      });
    });
  });
};

module.exports.getHistory = (req, res, next) => {
  console.log("his");
  let data = [];
  historyCheck.forEach((value, key) => {
    data.push({ format: key, info: value });
  });
  res.send({
    result: { history: data, error: [...mapError] },
  });
};

module.exports.getCheckExist = (req, res, next) => {
  const musicPath = req.params.musicPath;
  res.send({
    result: fs.existsSync(path.join(__dirname, "..", "musics", musicPath)),
    error: !fs.existsSync(path.join(__dirname, "..", "musics", musicPath)),
  });
};

module.exports.getFileAudioConverted = (req, res, next) => {
  const musicPath = req.params.musicPath;
  res.sendFile(path.join(__dirname, "..", "musics", musicPath));
};

module.exports.getStreamV2 = (req, res, next) => {
  const musicId = req.params.musicId;
  stream(urlBase + musicId).pipe(res);
};
