const express = require('express');
const router = express.Router();
const Author = require('../models/author')

router.get('/', async (req, res) => {
    const searchOption = {};
    if( req.query.name != null && req.query.name !== '' ){
        searchOption.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOption)
        res.render('authors/index', {authors: authors});
    } catch (error) {
        res.redirect('/');
    }
})
router.get('/add', (req, res) => {
        res.render('authors/add', { author: new Author() });
    })
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save();
        res.redirect('/authors');
    } catch (error) {
        res.render('authors/add', {
            author: author,
            errorMessage: "Something went wrong.." + error
        })
    }
})

module.exports = router