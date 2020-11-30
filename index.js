const express = require("express");
const app = express();
const expressWs = require("express-ws");
const {nanoid} = require("nanoid");
expressWs(app);

const activeConnections = {};
const circles = [];

app.ws("/canvas", (ws, req) => {
    const id = nanoid();
    console.log('client connected! id=', id);
    activeConnections[id] = ws;

    ws.on('message', (msg) => {
        const decodedCircle = JSON.parse(msg);
        console.log(decodedCircle)
        switch (decodedCircle.type) {
            case 'GET_ALL_CIRCLES':
                ws.send(JSON.stringify({type: "ALL_CIRCLES", circles}))
                break;
            case 'CREATE_CIRCLE':
                Object.keys(activeConnections).forEach(connId => {
                    const conn = activeConnections[connId];
                    circles.push(decodedCircle);
                    conn.send(JSON.stringify({
                        type: 'NEW_CIRCLE',
                            circle: decodedCircle
                    }));
                    console.log(circles)
                });
                break;
            default:
                console.log('Unknown message type:', decodedCircle.type);
        }
    });

    console.log(circles)

    ws.on('close', (msg) => {
        console.log('client disconnected! id=', id);
        delete activeConnections[id];
    });
});

app.listen(8000, () => {
    console.log("Server started at http://localhost:8000");
});