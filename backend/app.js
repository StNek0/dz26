// Подключаем необходимые модули и файлы
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./models/products')

require('dotenv').config()

// Подключаемся к базе данных

const dbUrl = process.env.DB_URL;
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(res => { console.log('connected to DB') })
  .catch(error => { console.log(error) })

const app = express()


app.use(express.static(path.join(__dirname, '../frontend'), {
  extensions: ['html', 'css', 'js']
}));
// Добавляем парсер для JSON и формы
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Роут главной страницы
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend', 'index.html'));
})

// Роут для отдачи клиенту скрипта
app.get('/script.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.sendFile(path.join(__dirname, '../frontend', 'script.js'))
});

// Роут получения всех товаров
app.get('/products', async (req, res) => {
  const products = await Product.find()
  res.json(products)
})

// Роут получения акционных товаров
app.get('/products-action', async (req, res) => {
  const products = await Product.find({ onSale: true })
  res.json(products)
})

// Роут для добавления нового товара
app.post('/add-product', async (req, res) => {
  const { title, price, onSale } = req.body
  const product = new Product({ title, price, onSale })
  try {
    await product.save()
    res.status(201).json(product)
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'failed to add product' })
  }
})
// Роут для случайных скидок
app.patch('/upd-products', async (req, res) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: 10 } }])
    products.forEach(async (product) => {
      let newPrice = (product.price * 0.75).toFixed(2)
      await Product.findByIdAndUpdate(product._id, { $set: { onSale: true, newPrice: newPrice } })
    })
    res.status(200).json({ message: 'products updated' })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to update products' })
  }
})

app.listen(process.env.PORT || 3000, () => console.log('server started'))