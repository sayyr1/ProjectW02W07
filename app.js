const express = require('express')

const bodyParser = require('body-parser');


const app = express();

const path = require('path')
app.use(express.static(path.join(__dirname, 'public')));


app.use(bodyParser.urlencoded({ extended: false }));
let products = []

app.get('/', (req, res, next) => {
    res.render('index', { pageTitle: 'Add Products'})
})

app.set('view engine', 'ejs');
app.set('views', 'views');

app.get('/products', (req, res, next) => {
    res.render('product', { pageTitle: 'Products', products: products })
})

app.post('/add-products', (req, res, next) => {
    products.push({ name: req.body.product, number: req.body.number, category: req.body.category  })
    res.redirect('/products')
    console.log(products)

})

app.post('/remove-products', (req, res, next) => {

    const removeProd = req.body.product;

    console.log(products)

    products = products.filter(product => product.name !== removeProd)

    res.redirect('/products')
})

app.listen(process.env.PORT||3000)