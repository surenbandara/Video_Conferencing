const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let totalDataSizeBytes = 0; // Initialize the total data size counter in bytes
let startTime = null; // Initialize the start time
const clients = new Map(); // Map to store client-specific data

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Function to convert bytes to megabytes (MB)
function bytesToMB(bytes) {
    return (bytes / (1024 * 1024)).toFixed(2); // Convert to MB and round to 2 decimal places
}

io.on('connection', (socket) => {
    console.log('A user connected');

    // Store client-specific data
    clients.set(socket.id, {
        totalDataSizeBytes: 0,
        startTime: null,
    });

    // Handle incoming video streams from clients
    socket.on('stream', (stream) => {
        // if (!startTime) {
        //     // Record the start time when the first stream is received
        //     startTime = Date.now();
        // }

        // Get the client's specific data
        const clientData = clients.get(socket.id);

        // // Check if stream.imageDataPart is defined and not empty
        // if (stream.imageDataPart && stream.imageDataPart.length > 0) {
        //     // Get the size of the incoming data in bytes
        //     const dataSizeBytes = Buffer.from(stream.imageDataPart, 'base64').length;

        //     // Increment the client's total data size counter in bytes
        //     clientData.totalDataSizeBytes += dataSizeBytes;

        //     // Increment the global total data size counter in bytes
        //     totalDataSizeBytes += dataSizeBytes;

        //     // Convert the data size to megabytes (MB)
        //     const dataSizeMB = bytesToMB(dataSizeBytes);

        //     // Calculate the elapsed time in seconds
        //     const currentTime = Date.now();
        //     const elapsedTimeSeconds = (currentTime - startTime) / 1000;

        //     if (elapsedTimeSeconds > 0) {
        //         // Calculate the data transfer rate for this client in Mb/s
        //         const dataTransferRateMbPerSec = (bytesToMB(clientData.totalDataSizeBytes) / elapsedTimeSeconds).toFixed(2);

        //         // Log the received data size, total data size, and data transfer rate in Mb/s for this client
        //         console.log(`Client ${socket.id}: Received data size: ${dataSizeMB} MB | Total data size: ${bytesToMB(clientData.totalDataSizeBytes)} MB | Data Transfer Rate: ${dataTransferRateMbPerSec} Mb/s`);
        //     }

            // Broadcast the stream to all connected clients except the sender
            const now = new Date();

            // Extract the current hour, minute, and second
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();

            // Calculate the timestamp in seconds
            const timestamp = Date.now();

            if (stream.timestamp > timestamp - 3000) {
                socket.broadcast.emit('stream', stream);
            }
         else {
            console.error('Invalid or empty ');
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');

        // Remove client-specific data when a client disconnects
        clients.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
