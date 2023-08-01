require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.json());

const uhrenRouter = require('./routes/uhren');
app.use('/uhren', uhrenRouter);


app.listen(3000, () => console.log('Server running on port 3000'));

