const nameList = ["Owl"];

const express = require("express");
const app = express();
const http = require('http');

const { Server } = require('socket.io');


const PORT = 5000;

const axios = require('axios');

const server = http.createServer(app);

const io = new Server(server);

io.on("connection", (socket) => {
    console.log(`User connected ${socket.id}`);
    socket.emit("get_usernamelist", nameList);

    socket.on("join_room", (data) => {
        socket.join(data.room);
        console.log(`user with ID: ${socket.id} joined room: ${data.room}`);
        nameList.push(data.username);
        socket.to(data.room).emit("receive_username", nameList);
    });

    socket.on("send_message", async (data) => {
        if(data.owlRequired) {
            socket.to(data.room).emit("receive_message", data);

            const res = await axios("https://api.quotable.io/random");

            const quote = res.data.content;
            const quoteData = {
                room: data.room,
                author: 'Owl',
                message: quote,
                time:  new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes()
            }
            socket.to(data.room).emit("receive_message", quoteData);
            socket.emit("receive_message", quoteData);
        } else {
            socket.to(data.room).emit("receive_message", data); 
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
    })
});

server.listen(PORT, () => {
    console.log("SERVER RUNNING...");
})