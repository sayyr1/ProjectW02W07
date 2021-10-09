const path = require('path');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;

// Import the model for users
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');
//
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('615f9d1aeb25bc658053deee')
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);


const corsOptions = {
  origin: "https://tranquil-reaches-00489.herokuapp.com/",
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  family: 4
};



mongoose.connect(process.env.MONGODB_URL ||'mongodb+srv://sayyr1:rpagm27MlsWl5EzU@cluster0.vs0of.mongodb.net/shop?retryWrites=true&w=majority').then(result => {
  User.findOne().then(user => {
    if (!user) {
      const user = new User({
        name: 'Sayri',
        email: 'sayri@test.com',
        cart: {
          items: []
        }
      });
      user.save()
    }
  })
  app.listen(process.env.PORT
    || 3000)
}).catch(err => {
  console.log(err)
})