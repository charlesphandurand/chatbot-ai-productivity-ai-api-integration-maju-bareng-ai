const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateGeminiText } = require('./gemini/client');
require('dotenv').config();

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/api/chat') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);
                const prompt = `Jawab pertanyaan ini dengan singkat dan jelas. Kalau tidak tahu, bilang saja tidak tahu. Gaya bahasa: Indonesia gaul (lo/gue, mantap).\n\nPertanyaan: ${message}`;
                const response = await generateGeminiText(prompt);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ response }));
            } catch (err) {
                console.error('Gemini API Error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'AI service unavailable' }));
            }
        });
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    if (req.url.startsWith('/api/')) {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }
    filePath = path.join(__dirname, filePath);

    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 CryptoSense AI running at http://localhost:${PORT}`);
});