const path = require('path');
const cors = require('cors') // Place this with other requires (like 'path' and 'express')


const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash')


const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;

// Import the model for users
const User = require('./models/user');

const MONGODB_URI = process.env.MONGODB_URL || 'mongodb+srv://sayyr1:rpagm27MlsWl5EzU@cluster0.vs0of.mongodb.net/shop?retryWrites=true&w=majority'

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
})

const csrfProtection = csrf()
app.set('view engine', 'ejs');
app.set('views', 'views');

// ROUTES
const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret',
  resave: false,
  saveUninitialized: false,
  store: store
}));

app.use(csrfProtection);
app.use(flash())


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {

      if (!user) {
        return next()
      }
      req.user = user;
      next()
    })
    .catch( err => {
      throw new Error(err)
    }
    );
})

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
})

// Adding routes
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)

app.get('/500', errorController.get500)

app.use(errorController.get404);

app.use((error, req, res, next) => {
  res.redirect('/500')
})





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



mongoose.connect(MONGODB_URI).then(result => {

  app.listen(process.env.PORT
    || 3000)
}).catch(err => {
  console.log(err)
})