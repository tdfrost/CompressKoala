const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path
const ffmpeg = require("fluent-ffmpeg")
ffmpeg.setFfmpegPath(ffmpegPath)
const path = require("path")
const ffmpegOnProgress = require("ffmpeg-on-progress")
const fs = require("fs")

ffmpeg.setFfmpegPath(ffmpegPath)

// Function to compress video
async function compressVideo(inputPath, outputPath, callback) {
  ffmpeg(inputPath)
    .outputOptions([
      "-b:v 0.5M", // Set the video bitrate to 0.5 Mbps to reduce file size
      "-vcodec libvpx-vp9", // Use VP9 codec for better compression
      "-crf 30", // Constant Rate Factor (quality control)
      "-b:a 128k", // Audio bitrate
    ])
    .on("start", (cmdline) => {
      console.log("Started compressing with command: " + cmdline)
    })
    .on("codecData", (data) => {
      // HERE YOU GET THE TOTAL TIME
      totalTime = parseInt(data.duration.replace(/:/g, ""))
    })
    .on("progress", (progress) => {
      const time = parseInt(progress.timemark.replace(/:/g, ""))
      const percent = (time / totalTime) * 100
      console.log("Processing: " + percent + "% done")
    })
    .on("end", () => {
      console.log("Compression finished!")
      callback(null, outputPath)
    })
    .on("error", (err) => {
      console.error("Error during compression: " + err.message)
      callback(err)
    })
    .save(outputPath)
}

// Path to your input video
const inputFile = path.join(
  process.cwd(),
  "videos",
  "input",
  "MAC-Homepage-loop-1.mp4"
)

// Path to save the compressed video
const outputFile = path.join(
  process.cwd(),
  "videos",
  "output",
  "MAC-Homepage-loop-1.webm"
)

console.log(inputFile)

if (fs.existsSync(inputFile)) {
  compressVideo(inputFile, outputFile, (err, outputPath) => {
    if (err) {
      console.error("Compression failed:", err)
    } else {
      console.log("Video compressed successfully! Output file: ", outputPath)
    }
  })
} else {
  console.error("Input file not found.")
}
