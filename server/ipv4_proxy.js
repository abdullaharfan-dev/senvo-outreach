import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

import http from 'http';
import https from 'https';
import net from 'net';

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url);
  const isHttps = parsed.protocol === 'https:';
  const transport = isHttps ? https : http;

  const proxyReq = transport.request({
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path: parsed.pathname + parsed.search,
    method: req.method,
    headers: req.headers,
    timeout: 10000
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end('Proxy error: ' + err.message);
  });

  req.pipe(proxyReq);
});

server.on('connect', (req, clientSocket, head) => {
  const [hostname, port] = req.url.split(':');
  const targetPort = parseInt(port, 10) || 443;

  const serverSocket = net.connect({
    host: hostname,
    port: targetPort,
    timeout: 10000
  }, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });

  serverSocket.on('error', (err) => {
    clientSocket.write('HTTP/1.1 502 Bad Gateway\r\n\r\n');
    clientSocket.end();
  });

  clientSocket.on('error', () => {
    serverSocket.destroy();
  });
});

server.listen(8888, '127.0.0.1', () => {
  console.log('[IPv4 Proxy] Listening on 127.0.0.1:8888 (with ipv4first)');
});
