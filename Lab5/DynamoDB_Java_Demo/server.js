const express = require('express');
const app = express();
const Product = require('./models/product.model');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
    const data = await Product.getAll();
    res.render('index', { products: data.Items });
});

app.post('/add', async (req, res) => {
    const { id, name, price, url_image } = req.body;
    await Product.save({ id, name, price, url_image });
    res.redirect('/');
});

// Route Xóa
app.post('/delete/:id', async (req, res) => {
    await Product.delete(req.params.id);
    res.redirect('/');
});

// Route Sửa (Lấy dữ liệu cũ đổ vào form - tùy chọn hoặc làm trực tiếp)
app.get('/edit/:id', async (req, res) => {
    try {
        const data = await Product.getAll();
        const productToEdit = data.Items.find(p => p.id === req.params.id);
        if (productToEdit) {
            res.render('edit', { product: productToEdit });
        } else {
            res.send("Không tìm thấy sản phẩm!");
        }
    } catch (error) {
        res.status(500).send("Lỗi: " + error.message);
    }
});

// Route xử lý cập nhật dữ liệu
app.post('/update/:id', async (req, res) => {
    try {
        const { name, price, url_image } = req.body;
        await Product.update(req.params.id, { name, price, url_image });
        res.redirect('/');
    } catch (error) {
        res.status(500).send("Lỗi cập nhật: " + error.message);
    }
});
app.listen(3000, () => console.log('Server running at http://localhost:3000'));