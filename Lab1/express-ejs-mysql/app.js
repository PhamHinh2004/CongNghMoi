const express = require('express');
const app = express();
const path = require('path');
const productRoutes = require('./routes/product.routes');

// 1. config view engine is ejs 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 2. Middleware to read data from form (req.body)
app.use(express.urlencoded({extended: true}));
app.use('/', productRoutes);

// 4. run server 
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});