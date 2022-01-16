const express = require('express');
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const imageMIMETypes = ['image/gif','image/jpeg','image/png','image/svg+xml'];
const uploadPath = path.join('public', Book.coverImageBasePath)

const upload = multer({ 
    dest: uploadPath,
    fileFilter: (req, file, cb) => {
        cb(null, imageMIMETypes.includes(file.mimetype))
    }
 })
//All Books list
router.get('/', async (req, res) => {
    const searchOption = {};
    if( req.query.name != null && req.query.name !== '' ){
        searchOption.title = new RegExp(req.query.name, 'i')
    }
    if( req.query.publishBefore != null && req.query.publishBefore !== '' ){
        searchOption.publishDate = { $lt: req.query.publishBefore }
    }
    if( req.query.publishAfter != null && req.query.publishAfter !== '' ){
        searchOption.publishDate = { $gt: req.query.publishAfter }
    }
    try {
        const books = await Book.find(searchOption)
        res.render('books/index', {books: books, searchOption: req.query});
    } catch (error) {
        res.redirect('/');
    }
})
//Add new Book
router.get('/add', async (req, res) => {
    renderFromPage(res, new Book(), 'add')
})

//Edit Book
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        const authors = await Author.find();
        res.render('books/edit', { book: book, authors:authors })
    } catch (error) {
        res.redirect('/')
    }
})

//Update book
router.put('/:id',  upload.single('cover'), async (req, res) => {
    let book
    const fileName = req.file != null ? req.file.filename : null;
    try {
        book = await Book.findById(req.params.id);
        book.title = req.body.title
        book.author = req.body.author
        book.description = req.body.description
        book.publishDate = new Date(req.body.publishDate)
        book.pageCount = req.body.pageCount
        if( fileName !== null){
            book.coverImageName = fileName
        }

        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}/edit`)
    } catch (error) {
        if( book.coverImageName != null ){
            removeCoverImage(book.coverImageName)
        }
        renderFromPage(res, book,'edit', true)
    }
})

//View Book
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', { book: book })
    } catch (error) {
        res.redirect('/')
    }
})
//Add to Library
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        description: req.body.description,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName
    })

    try {
        const newBook = await book.save();
        //res.render(`books/${newBook.id}`)
        res.redirect('/books');
    } catch (error) {
        if( book.coverImageName != null ){
            removeCoverImage(book.coverImageName)
        }
        renderFromPage(res, new Book(),'add', true)
    }
})
function removeCoverImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}
async function renderFromPage(res, book, from, hasError = false){
    try {
        const authors = await Author.find();
        const params = { 
            book: book, 
            authors: authors 
        }

        if (hasError) params.errorMessage = 'Error occurred!';
        res.render(`books/${from}`, params)
    } catch (error) {
        res.redirect('books/', {
            errorMessage: "Something went wrong.." + error
        })
    }
}

//Delete Book
router.delete('/:id', async (req, res)=>{
    let book;
    try {
        book = await Book.findById(req.params.id)
        await book.remove();
        res.redirect('/books');
    } catch (error) {
        if( book == null){
            res.redirect('/')
        } else{
            res.render(`books`, {
                errorMessage: "Something went wrong.." + error
            })
        }
    }
});

module.exports = router