// const moment = require('moment');
const connect = require('../models/connection');

let onlineUsers = [];

const getAll = async () => {
  const messages = await connect()
  .then((db) => db.collection('messages').find().toArray());
  return messages;
};

const onConnect = async (socket, userId) => {
  onlineUsers.push(userId);
  const messages = await getAll();
  if (messages.length) socket.emit('history', messages);
  socket.emit('whoAmI', userId);
  socket.emit('onlineUsers', onlineUsers);
  socket.broadcast.emit('onlineUsers', onlineUsers);
};

const saveMessage = async (message, nickname, timestamp) => {
  await connect()
      .then((db) => db.collection('messages')
      .insertOne({ message, nickname, timestamp }));
};

const changeNick = (io, socket, nickName, newNickName) => {
  onlineUsers = onlineUsers.filter((user) => user !== nickName);
  onlineUsers.push(newNickName);
  socket.emit('whoAmI', newNickName);
  io.emit('onlineUsers', onlineUsers);
  // console.log('Enviei para todos os usuários essa nova lista:', onlineUsers);
};

const disconnect = (socket, userId) => {
  onlineUsers = onlineUsers.filter((user) => user !== userId);
  socket.broadcast.emit('onlineUsers', onlineUsers);
};

module.exports = {
  onConnect,
  saveMessage,
  changeNick,
  disconnect,
  onlineUsers,
};
