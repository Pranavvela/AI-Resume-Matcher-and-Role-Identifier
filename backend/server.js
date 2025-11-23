const express = require("express");
const multer = require("multer");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const FormData = require("form-data");

const app = express();
app.use(cors());

// Multer setup
const upload = multer({ dest: "uploads/" });

// ------------------------------------------
// API: Upload Resume → Forward to Python ML
// ------------------------------------------
app.post("/analyze", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Create a FormData object to send file to FastAPI
    const formData = new FormData();
    formData.append("file", fs.readFileSync(filePath), req.file.originalname);

    const response = await axios.post(
      "http://127.0.0.1:8001/analyze",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    // Delete file after processing
    fs.unlinkSync(filePath);

    res.json(response.data);
  } catch (error) {
    console.error("Error backend → ML:", error);
    res.status(500).json({ error: "Processing failed" });
  }
});

// ------------------------------------------
app.listen(5000, () => {
  console.log("Backend server running at http://localhost:5000");
});
