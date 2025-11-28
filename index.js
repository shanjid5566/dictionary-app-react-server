const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/define/:word', async (req, res) => {
  const word = req.params.word;
  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const entries = response.data;

    // Translate helper using LibreTranslate (free public instance)
    const translateText = async (text, target = 'bn') => {
      try {
        const tl = await axios.post(
          'https://libretranslate.de/translate',
          {
            q: text,
            source: 'en',
            target,
            format: 'text'
          },
          {
            headers: { 'Content-Type': 'application/json' }
          }
        );
        return tl.data && tl.data.translatedText ? tl.data.translatedText : null;
      } catch (e) {
        return null;
      }
    };

    // For each entry -> meaning -> definition, translate definition text into Bangla
    await Promise.all(
      entries.map(async (entry) => {
        if (!entry.meanings) return;
        await Promise.all(
          entry.meanings.map(async (meaning) => {
            if (!meaning.definitions) return;
            const defs = meaning.definitions;
            // Translate all definitions in parallel
            const translations = await Promise.all(defs.map((d) => translateText(d.definition)));
            defs.forEach((d, i) => {
              d.bn = translations[i];
            });
          })
        );
      })
    );

    res.json(entries);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: 'Word not found. Please check the spelling.' });
    } else {
      res.status(500).json({ message: 'An error occurred while fetching the definition.' });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Smart Dictionary Backend is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
