const express = require('express');
const router = express.Router();
const Author = require('../models/author')
const Book = require('../models/book')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const imageMIMETypes = ['images/gif','images/jpeg','images/png','images/svg+xml'];
const uploadPath = path.join('public', Book.coverImageBasePath)

const upload = multer({ 
    dest: uploadPath
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
    renderNewPage(res, new Book())
})
//Add to Library
router.post('/', upload.single('cover'), async (req, res) => {
    const fileName = req.file != null ? req.file.filename : null;
    console.log("Image ", req.file)
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
        renderNewPage(res, new Book(), true)
    }
})
function removeCoverImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}
async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find();
        const book = new Book();
        const params = { 
            book: book, 
            authors: authors 
        }

        if (hasError) params.errorMessage = 'Error occurred!';
        res.render('books/add', params)
    } catch (error) {
        res.redirect('books/', {
            errorMessage: "Something went wrong.." + error
        })
    }
}

module.exports = router