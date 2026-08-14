export const ws = new WebSocket(import.meta.env.VITE_WS_SERVER_URL);

ws.onerror = ((err) => {
    console.log(err);
});

ws.onclose = (event) => {
    console.log(event.code);
    console.log(event.reason);
};

ws.onmessage = (event) => {
    console.log(event.data);
}
