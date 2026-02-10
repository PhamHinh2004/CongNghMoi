const express = require('express');
const router = express.Router();
const db = require('../db/mysql');


// 1. home: get all products
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM products');
        res.render('products', { products: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }   
});


// 2. Chức năng: Thêm sản phẩm (Nhận dữ liệu từ Form)
router.post('/add', async (req, res) => {
    // Lấy dữ liệu từ thẻ input
    const { name, price, quantity } = req.body;

    try {
        // Chèn vào DB (Dùng dấu ? để tránh SQL Injection)
        await db.query(
            'INSERT INTO products(name, price, quantity) VALUES (?, ?, ?)',
            [name, price, quantity]
        );
        
        // Xong thì load lại trang chủ
        res.redirect('/');
    } catch (e) {
        console.log(e);
        res.status(500).send('Lỗi thêm mới');
    }
});

// 3. chức năng: xóa sản phẩm
// 3. Xóa sản phẩm
router.post('/delete/:id', async (req, res) => {
    const productId = req.params.id;
    await db.query('DELETE FROM products WHERE id = ?', [productId]);
    res.redirect('/');
});

// 4. chức năng: sửa sản phẩm (hiển thị form sửa)
router.get('/edit/:id', async (req, res) => {
    const productId = req.params.id;
    try {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (rows.length === 0) {
            return res.status(404).send('Sản phẩm không tồn tại');
        }
        res.render('edit_product', { product: rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi hiển thị form sửa sản phẩm');
    }
});
module.exports = router;