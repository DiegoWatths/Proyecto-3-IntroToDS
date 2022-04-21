const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const path = require('path')


app.use(cors());
app.use(express.json());
require('./database/userDatabase').connect();

const userRoutes = require("./routes/userRoutes")
const friendRoutes = require("./routes/friendRoutes")

const PORT = process.env.PORT || 2;
const HOST = process.env.HOST || "http://localhost";

app.use(userRoutes);
app.use(friendRoutes);
app.use(morgan('combined', { stream: accessLogStream }));

var accessLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'users.log'), { flags: 'a' })

app.listen(PORT, () => console.log(`El servicio de los usuarios y sistema de amigos está en ${HOST}:${PORT}`))