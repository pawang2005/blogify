require('dotenv').config();
const express = require('express');
const app = express();
const userRoute = require('./routes/route.js');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const checkForAuthentication = require('./middleware/authentication.js');
const blogRoute = require('./routes/blogroute.js');
const Blog = require('./models/blog.js');
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));
app.use(cookieParser());
app.use(checkForAuthentication('token'));
app.use('/blog', blogRoute);
app.use(express.static(path.resolve('./public')));

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDb Connected'))
  .catch(e => console.log(e));

app.get('/', async (req, res) => {
  try {
    const allBlog = await Blog.find({}).lean();
    console.log(allBlog);

    return res.render('home', {
      user: req.user,
      blogs: allBlog
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.use('/', userRoute);
app.listen(PORT, () => { console.log(`Server Started at port ${PORT}`); });
