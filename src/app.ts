import express from 'express';
import bodyParser from 'body-parser';
import identifyRouter from './routes/identify';

const app = express();

// Add body parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/identify', identifyRouter);

export default app; // Make sure to export for testing