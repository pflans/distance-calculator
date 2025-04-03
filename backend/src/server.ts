import express from 'express';
import { setupMiddleware } from './middleware';
import routes from './routes';

const app = express();
const port = process.env.PORT || 3000;

setupMiddleware(app);

app.use('/', routes);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
