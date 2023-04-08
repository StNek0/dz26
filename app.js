// Подключаем необходимые модули и файлы
const express = require('express')
const ejs = require('ejs')
const path = require('path')
const mongoose = require('mongoose')
const Product = require('./models/products')

// Подключаемся к базе данных
const db = 'mongodb+srv://samusevich21032007:samusevich21032007@cluster0.l9lrrg4.mongodb.net/?retryWrites=true&w=majority'
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(res => { console.log('connected to DB') })
  .catch(error => { console.log(error) })

// Создаем экземпляр приложения
const app = express()

// Устанавливаем шаблонизатор EJS
app.set('view engine', 'ejs')

// Устанавливаем путь к статическим файлам в папке styles (доступ к стилям)
app.use(express.static(path.join(__dirname, 'styles')))

// Добавляем парсер для JSON и формы
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Функция, которая возвращает путь к шаблону по его имени
const createPath = (page) => (path.resolve(__dirname, `${page}.ejs`))

// Роут для отдачи клиенту скрипта
app.get('/script.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.sendFile(__dirname + '/script.js');
});

// Роут главной страницы
app.get('/', async (req, res) => {
  res.render(createPath('index'), { products: [], productsSale: [] })
})

// Роут получения всех товаров
app.get('/products', async (req, res) => {
  const products = await Product.find()
  // res.render(createPath('index'), ({ products, productsSale: [] }))// with reload
  res.json(products) //w/o reload
})

// Роут получения товаров со скидкой
app.get('/products-action', async (req, res) => {
  //*const products = await Product.find()
  const productsSale = await Product.find({ onSale: true })
  //res.render(createPath('index'), { products: [], productsSale })
  res.json(productsSale)
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
    const products = await Product.aggregate([{ $sample: { size: 1 } }])
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

// Роут для RESETа
app.patch('/reset', async (req, res) => {
  /* try {
    res.render(createPath('index'), { products: [], productsSale: [] })
    res.status(200).json({ message: 'products reseted' })
  }
  catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to reset products' })
  } */
})

app.listen(3000, () => console.log('server started'))