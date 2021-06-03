const app = require('express')();
const http = require('http').createServer(app);
const cors = require('cors');
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const utils = require('./utils');

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).render('template');
});

io.on('connection', (socket) => {
  let newUserId = socket.id.slice(0, 16);
  utils.onConnect(socket, newUserId);

  socket.on('message', async ({ chatMessage, nickname }) => {
    await utils.saveMessage(io, chatMessage, nickname);
  });

  socket.on('setNickname', (nickName) => {
    // console.log('Me chamaram para colocar esse nick: ', nickName);
    // console.log('Meu nome de usuário atual é ', newUserId);
    utils.changeNick(io, socket, newUserId, nickName);
    newUserId = nickName;
    // console.log('Meu novo nome é', newUserId);
  });

  socket.on('disconnect', () => {
    utils.disconnect(socket, newUserId);
  });
});

http.listen(3000, () => {
  console.log('Servidor ouvindo na porta 3000');
});
