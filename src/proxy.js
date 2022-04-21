const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
const { createClient } = require("redis");
require('dotenv').config({path: '../.env'})

const PORT = process.env.PORT || 1;
const HOST = process.env.HOST || 'http://localhost';
const USERS_URI = process.env.USERS_URI;
const POST_URI = process.env.POST_URI;

app.use(cors());
app.use(express.json());

const client = createClient({
    host: "127.0.0.1",
    port: 6379,
  });

//One-valued endpoints (i.e service/endpoint)
app.all('/:params', async (req, res) => {
    // Search Data in Redis
    const reply = await client.get(req.params.params);

    // if exists returns from redis and finish with response
    if (reply) return res.send(JSON.parse(reply));

    switch (req.params.params) {
        case 'register':
        case 'login':
        case 'allUsers':
        case 'addFriend':
        case 'removeFriend':
            req.headers.authorization? 
            await send(`${USERS_URI}/${req.params.params}`, req.method, req.headers.authorization, req.body, res)
            : await send(`${USERS_URI}/${req.params.params}`, req.method, 'no authorization', req.body, res);
            break;

        case 'publish':
        case 'allPosts':
            req.headers.authorization? 
            await send(`${POST_URI}/${req.params.params}`, req.method, req.headers.authorization, req.body, res)
            : await send(`${POST_URI}/${req.params.params}`, req.method, 'no authorization', req.body, res);
            break;

        default:
            res.status(404).send('Papi esa ruta no existe...');
            break;
    }
})

//Two-valued endpoints (i.e service/endpoint/params)
app.all('/:params/:params2', async (req, res) => {
    // Search Data in Redis
    const reply = await client.get(req.params.params);

    // if exists returns from redis and finish with response
    if (reply) return res.send(JSON.parse(reply));

    switch (req.params.params) {
        case 'searchForUser':
        case 'patchUser':
        case 'deleteUser':
            req.headers.authorization? 
            await send(`${USERS_URI}/${req.params.params}/${req.params.params2}`, req.method, req.headers.authorization, req.body, res)
            : await send(`${USERS_URI}/${req.params.params}/${req.params.params2}`, req.method, 'no authorization', req.body, res);
            break;

        case 'commentToPost':
            req.headers.authorization? 
            await send(`${POST_URI}/${req.params.params}/${req.params.params2}`, req.method, req.headers.authorization, req.body, res)
            : await send(`${POST_URI}/${req.params.params}/${req.params.params2}`, req.method, 'no authorization', req.body, res);
            break;
            
        default:
            res.status(404).send('Papi esa ruta no existe...');
            break;
    }
})

async function send(route, method, auth, ob, res) {
    try {
        const response = await axios({
            method: method,
            url: route,
            data: { originalBody: ob },
            headers:{ Authorization: auth }
        })

        const saveResult = await client.set(
            getEndpoint(route),
            JSON.stringify(response),
            {
              EX: 300,
            }
          );
          console.log(saveResult)

        res.json(response)
    } catch (error) {
        console.log(error.message);
    }
}

function getEndpoint(route) {
    var result;

    result = route.replace(`${USERS_URI}/`, '');
    result = result.replace(`${POST_URI}/`, '');

    return result
}

app.listen(PORT, () => console.log(`El proxy está en ${HOST}:${PORT}`));