const productRepo = require('../repositories/productRepo');
const productService = require('../services/productService');

exports.listProducts = async (req, res, docClient) => {
    try {
        const data = await productRepo.getAllActive(docClient);
        const products = productService.formatInventoryStatus(data.Items);
        res.render('index', { products: products, user: req.session.user });
    } catch (err) {
        res.status(500).send("Lỗi server: " + err.message);
    }
};