const express = require('express');
const cors = require('cors');
const app = express();
const morgan = require('morgan');
const path = require('path')

app.use(cors());
app.use(express.json());
require('./database/postDatabase').connect();
require('../userService/database/userDatabase').connect();

const postRoutes = require("./routes/postRoutes")
const commentRoutes = require("./routes/commentRoutes")

const PORT = process.env.PORT || 3;
const HOST = process.env.HOST || "http://localhost";

app.use(postRoutes);
app.use(commentRoutes);

app.use(morgan('combined', { stream: accessLogStream }));

var accessLogStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'posts.log'), { flags: 'a' })

app.listen(PORT, () => console.log(`El servicio de las publicaciones y comentarios está en ${HOST}:${PORT}`))
