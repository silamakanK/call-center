const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3001 });
const users = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      return;
    }

    switch (data.type) {
      case 'login':
        if ([...users.keys()].includes(data.name)) {
          sendTo(ws, { type: 'login', success: false });
        } else {
          ws.name = data.name;
          users.set(data.name, ws);
          sendTo(ws, { type: 'login', success: true, users: [...users.keys()] });
          broadcast({ type: 'new-user', name: data.name }, ws);
        }
        break;

      case 'call':
      case 'offer':
      case 'answer':
      case 'candidate':
      case 'accept':
      case 'reject':
        const target = users.get(data.target);
        if (target) sendTo(target, { ...data, from: ws.name });
        break;

      case 'leave':
        users.delete(ws.name);
        broadcast({ type: 'user-left', name: ws.name });
        break;
    }
  });

  ws.on('close', () => {
    if (ws.name) {
      users.delete(ws.name);
      broadcast({ type: 'user-left', name: ws.name });
    }
  });
});

function sendTo(conn, msg) {
  conn.send(JSON.stringify(msg));
}

function broadcast(msg, except) {
  users.forEach((ws) => {
    if (ws !== except) sendTo(ws, msg);
  });
}

console.log("WebSocket server started on ws://localhost:3001");
