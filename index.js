const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const serveJsonFile = (req, res) => {
  const segments = req.path.split('/').filter(Boolean);

  if (segments.length < 2) {
    return res.status(404).json({ message: 'Invalid path' });
  }

  const [prefix, id, ...restSegments] = segments;
  const suffix = restSegments.filter(Boolean).join('_');

  const fileNameParts = [prefix, id];
  if (suffix) {
    fileNameParts.push(suffix);
  }

  const fileName = `${fileNameParts.join('_')}.json`;
  const filePath = path.join(__dirname, 'data', fileName);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ message: `File ${fileName} not found` });
      }
      console.error(err);
      return res.status(500).json({ message: 'Failed to read file' });
    }

    try {
      const parsed = JSON.parse(data);
      return res.json(parsed);
    } catch (parseError) {
      console.error(parseError);
      return res.status(500).json({ message: 'File contents are not valid JSON' });
    }
  });
};

app.all(/.*/, serveJsonFile);


app.listen(PORT, () => {
  console.log(`Mock API server is running at http://localhost:${PORT}`);
});

