if( process.env.NODE_ENV !== 'production' ){
    require('dotenv').config()
}
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');
app.set('layout', './layouts/layout');
app.use(expressLayouts)
//routes
const indexRoute = require('./routes/index')

//database connection....
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection
db.on('error', error => console.error("Connection Error", error))
db.once('open', () => console.log("Connected to mongoose...") )
app.use('/', indexRoute);

//listen server.....
app.listen(process.env.PORT || 3000)