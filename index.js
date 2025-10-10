const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/define/:word", async (req, res) => {
  const word = req.params.word;
  try {
    const response = await axios.get(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );

    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res
        .status(404)
        .json({ message: "Word not found. Please check the spelling." });
    } else {
      res
        .status(500)
        .json({ message: "An error occurred while fetching the definition." });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Smart Dictionary Backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
