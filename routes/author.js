const express = require('express');
const { find } = require('../models/author');
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book')

//All Authors
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

//Add Authors
router.get('/add', (req, res) => {
        res.render('authors/add', { author: new Author() });
    })
//Save Author    
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name
    })
    try {
        await author.save();
        res.redirect('/authors');
    } catch (error) {
        res.render('authors/add', {
            author: author,
            errorMessage: "Something went wrong.." + error
        })
    }
})
//view Author
router.get('/:id', async (req, res)=>{
    try {
        const author = await Author.findById(req.params.id)
        const books = await Book.find({author: req.params.id})
        res.render('authors/show', { author: author, books: books });
    } catch (error) {
        res.redirect('/authors');
    }
});
//Edit Author
router.get('/:id/edit', async (req, res)=>{
    try {
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author });
    } catch (error) {
        res.redirect('/authors');
    }
});
//Update Author
router.put('/:id', async (req, res)=>{
    let author;
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save();
        res.redirect('/authors');
    } catch (error) {
        if( author == null){
            res.redirect('/')
        }
        res.render(`authors/`, {
            errorMessage: "Something went wrong.." + error
        })
    }
});
//Delete Author
router.delete('/:id', async (req, res)=>{
    let author;
    try {
        author = await Author.findById(req.params.id)
        await author.remove();
        res.redirect('/authors');
    } catch (error) {
        if( author == null){
            res.redirect('/')
        } else{
            res.render(`authors`, {
                errorMessage: "Something went wrong.." + error
            })
        }
    }
});

module.exports = router