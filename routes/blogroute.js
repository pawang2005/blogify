const { Router } = require('express');
const Blog = require('../models/blog.js');
const router = Router();
const multer = require('multer');
const path = require('path');
const Comment = require('../models/comment.js');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.resolve(`./public/uploads`));
    },
    filename: function(req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    }
});

const uploads = multer({ storage });

router.get('/add-new', (req, res) => {
    return res.render('addblog', {
        user: req.user,
    });
});

router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("createdBy");
        const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
        return res.render("blog", {
            user: req.user,
            blog,
            comments,
        });
    } catch (error) {
        console.error("Error fetching blog or comments:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/comment/:blogId', async (req, res) => {
    try {
        await Comment.create({
            content: req.body.content,
            blogId: req.params.blogId,
            createdBy: req.user._id,  // Corrected this line
        });
        return res.redirect(`/blog/${req.params.blogId}`);
    } catch (error) {
        console.error("Error creating comment:", error);
        return res.status(500).send("Internal Server Error");
    }
});

router.post('/', uploads.single('coverImage'), async (req, res) => {
    try {
        const { title, body } = req.body;
        const blog = await Blog.create({
            body,
            title,
            createdBy: req.user._id,
            coverImageURL: `/uploads/${req.file.filename}`
        });
        return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
        console.error("Error creating blog:", error);
        return res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
