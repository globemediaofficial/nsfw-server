import express from "express";
import nsfwjs from "nsfwjs";
import * as tf from "@tensorflow/tfjs-node";
import { createCanvas, loadImage } from "canvas";
import multer from "multer";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

let model;

// Load NSFW model on startup
nsfwjs.load().then((m) => {
  model = m;
  console.log("NSFW Model loaded!");
});

// Helper to map predictions to "nsfw", "safe", or "unknown"
function classify(predictions) {
  const nsfwScore = predictions
    .filter((p) => ["Porn", "Hentai", "Sexy"].includes(p.className))
    .reduce((sum, p) => sum + p.probability, 0);
  const safeScore = predictions.find((p) => p.className === "Neutral")?.probability || 0;

  if (nsfwScore > 0.7) return "nsfw";
  if (safeScore > 0.7) return "safe";
  return "unknown";
}

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!model) return res.status(503).json({ error: "Model not loaded yet" });
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    const img = await loadImage(req.file.buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const predictions = await model.classify(canvas);
    const result = classify(predictions);

    res.json({ result, predictions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to classify image" });
  }
});

app.get("/", (_, res) => res.send("NSFW server is running!"));

const PORT = process.env.PORT || 2400;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
