const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let totalDataSizeBytes = 0; // Initialize the total data size counter in bytes
let startTime = null; // Initialize the start time

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Function to convert bytes to megabytes (MB)
function bytesToMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2); // Convert to MB and round to 2 decimal places
}

io.on('connection', (socket) => {
    console.log('A user connected');

    // Handle incoming video streams from clients
    socket.on('stream', (stream) => {
        if (!startTime) {
            // Record the start time when the first stream is received
            startTime = Date.now();
        }

        // Get the size of the incoming data in bytes
        const dataSizeBytes = Buffer.from(stream.imageData, 'base64').length;

        // Increment the total data size counter in bytes
        totalDataSizeBytes += dataSizeBytes;

        // Convert the data size to megabytes (MB)
        const dataSizeMB = bytesToMB(dataSizeBytes);

        // Calculate the elapsed time in seconds
        const currentTime = Date.now();
        const elapsedTimeSeconds = (currentTime - startTime) / 1000;

        if (elapsedTimeSeconds > 0) {
            // Calculate the data transfer rate in Mb/s
            const dataTransferRateMbPerSec = (bytesToMB(totalDataSizeBytes) / elapsedTimeSeconds).toFixed(2);

            // Log the received data size, total data size, and data transfer rate in Mb/s
            console.log(`Received data size: ${dataSizeMB} MB | Total data size: ${bytesToMB(totalDataSizeBytes)} MB | Data Transfer Rate: ${dataTransferRateMbPerSec} Mb/s`);
        }

        // Broadcast the stream to all connected clients except the sender
        socket.broadcast.emit('stream', stream);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
