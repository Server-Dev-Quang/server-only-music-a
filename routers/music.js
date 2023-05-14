const router = require("express").Router();
const MusicController = require("../controllers/music");

router.use("/mp3/:musicId", MusicController.getStreamV2);

router.use("/mp3-ytdl-code/:musicPath", MusicController.getStreamAudioMp3);

router.use("/music-check/:musicPath", MusicController.getConvertAudio);

router.use("/history", MusicController.getHistory);

router.use("/exist/:musicPath", MusicController.getCheckExist);

router.use("/file/:musicPath", MusicController.getFileAudioConverted);

module.exports = router;
