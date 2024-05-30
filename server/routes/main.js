const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// Home Route
router.get('/', async (req, res) => {
  try {
    const locals = {
      title: "Nodejs Blogs",
      description: "First Blog about Nodejs"
    };
    const perPage = 10;
    const page = parseInt(req.query.page) || 1;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();

    const count = await Post.countDocuments();
    const totalPages = Math.ceil(count / perPage);
    const nextPage = page < totalPages ? page + 1 : null;
 
    res.render('index', {
      locals,
      posts,
      current: page,
      nextPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


// Get posts
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);

    const locals = {
      title: post.title,
      description: post.description
    }
    if (!post) {
      return res.status(404).render('404', { message: "Post not found" });
    }

    res.render('post', { locals: locals, post: post });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


router.post('/search', async (req, res) => {
  try {
    const searchTerm = req.body.searchTerm;

    // Perform search logic to find posts containing the search term
    const posts = await Post.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search for title
        { body: { $regex: searchTerm, $options: 'i' } }    // Case-insensitive search for body
      ]
    });

    // Render the search results view with the found posts and the search term
    res.render('search', { posts: posts, searchTerm: searchTerm });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
});


router.get('/about', (req, res) => {
  res.render('about');
});

module.exports = router;
