const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const inputFile = "/musics/Dsi5uZxoy-E.mp3";
const musicInputFile = "Dsi5uZxoy-E.mp3";
const musicOutputFile = "Dsi5uZxoy-E.m4a";
const outputFile = "/musics";

exec(
  `ffmpeg -i ${__dirname.replace(/\\/g, "/") + `/musics/${musicInputFile}`} ${
    __dirname.replace(/\\/g, "/") + `/musics/${musicOutputFile}`
  }`,
  (err, std) => {
    console.log(err);
    console.log(std);
  }
);

console.log(__dirname, __dirname.replace(/\\/g, "/"));
console.log(
  `ffmpeg -i ${__dirname.replace(/\\/g, "/") + `/musics/${musicInputFile}`} ${
    __dirname.replace(/\\/g, "/") + `/musics/${musicOutputFile}`
  }`
);

let cnt = 0;
let xxx = 555;
for (let i = 0; i < 1000; i++) {
  let map = new Map();
  let arr = [];
  for (let j = 0; j < 1000; j++) {
    cnt++;
    let rand = Math.random();
    map.set(rand, true);
    arr.push(rand);
  }
  let k = 0;
  map.forEach((value, key) => {
    if (key !== arr[k]) console.log("wrong");
    ++k;
  });
}

console.log("correct", cnt);
