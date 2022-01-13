if( process.env.NODE_ENV !== 'production' ){
    require('dotenv').config()
}
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')

const app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname+'/views');
app.set('layout', './layouts/layout');

app.use(express.static('public'));
app.use(expressLayouts);
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
//routes
const indexRoute = require('./routes/index')
const authorRoute = require('./routes/author')
const bookRoute = require('./routes/book')

//database connection....
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
const db = mongoose.connection
db.on('error', error => console.error("Connection Error", error))
db.once('open', () => console.log("Connected to mongoose...") )
app.use('/', indexRoute);
app.use('/authors', authorRoute);
app.use('/books', bookRoute);

//listen server.....
app.listen(process.env.PORT || 3000)