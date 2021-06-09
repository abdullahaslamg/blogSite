const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');

const app = express();

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('successfully connected');
  });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Success');
});

app.use('/api/v1/users', userRoutes);

app.all('*', (req, res, next) => {
    const error = new Error(`Cann't find ${req.originalUrl} on this server`);
    next(error);
})

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    })
})

app.get('/newTour', (req, res) => {
  res.send('You aer sending a files')
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App is listeneing on port ${port}`);
});


