const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const USER_LIMIT = 20;

app.use(express.static('public'));  // Serve static files from the 'public' directory

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
    if (io.engine.clientsCount > USER_LIMIT) {
        socket.emit('server-full');
        socket.disconnect();
        console.log('Disconnected a user due to server limit reached.');
        return;
    }

    
    console.log('User connected:', socket.id);

    socket.on('image', (data) => {
        io.emit('update-image', { id: socket.id, image: data });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        socket.broadcast.emit('user-disconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log('Server listening on port 3000');
});
