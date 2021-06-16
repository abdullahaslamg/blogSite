const express = require('express');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const globalErrorController = require('./controllers/errorController');

const app = express();
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);

app.all('*', (req, res, next) => {
  const error = new Error(`Cann't find ${req.originalUrl} on this server`);
  next(error);
});

app.use(globalErrorController);

module.exports = app;
