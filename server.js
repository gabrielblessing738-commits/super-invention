import http from "http";

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Hello from Fly.io without using a terminal!");
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
