require('dotenv').config();
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const multer = require('multer');
const upload = multer();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand, PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const productController = require('./controllers/productController');
const productRepo = require('./repositories/productRepo');

const app = express();

// --- CẤU HÌNH DYNAMODB ---
const dbClient = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-1' });
const docClient = DynamoDBDocumentClient.from(dbClient);

// --- MIDDLEWARE ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'khanh_secret_key_2026',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

const requireAuth = (req, res, next) => {
  if (!req.session.user) return res.redirect('/login');
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.session.user?.role !== 'admin') return res.status(403).send("Quyền Admin yêu cầu!");
  next();
};

// --- ROUTES AUTH ---
app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_USERS,
      FilterExpression: "username = :u",
      ExpressionAttributeValues: { ":u": username }
    };
    const data = await docClient.send(new ScanCommand(params));
    const user = data.Items ? data.Items[0] : null;

    if (user && user.password === password) {
      req.session.user = { id: user.userId, username: user.username, role: user.role };
      req.session.save(() => res.redirect('/'));
    } else {
      res.send("<h3>Sai tài khoản hoặc mật khẩu!</h3><a href='/login'>Thử lại</a>");
    }
  } catch (err) { res.status(500).send("Lỗi đăng nhập."); }
});
app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/login')));

// --- ROUTES PRODUCT ---

app.get('/', requireAuth, (req, res) => {
  productController.listProducts(req, res, docClient);
});

// THÊM SẢN PHẨM
app.get('/add', requireAuth, requireAdmin, (req, res) => {
  res.render('add');
});

app.post('/add', requireAuth, requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, price, quantity } = req.body;
    // Tạm thời để URL placeholder, sau này thay bằng logic upload S3 thực tế
    const imageUrl = "https://via.placeholder.com/150";

    const newItem = {
      id: crypto.randomUUID(),
      name,
      price: Number(price),
      quantity: Number(quantity),
      url_image: imageUrl,
      isDeleted: false,
      createdAt: new Date().toISOString()
    };
    await productRepo.save(newItem, docClient);
    res.redirect('/');
  } catch (err) { res.status(500).send("Lỗi thêm sản phẩm: " + err.message); }
});

// SỬA SẢN PHẨM (Giao diện)
app.get('/edit/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const data = await docClient.send(new GetCommand({
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: { id: req.params.id }
    }));
    if (!data.Item) return res.status(404).send("Không tìm thấy sản phẩm");
    res.render('edit', { product: data.Item });
  } catch (err) { res.status(500).send(err.message); }
});

// CẬP NHẬT SẢN PHẨM (Xử lý POST) - Đã fix khớp với edit.ejs của bạn
app.post('/edit', requireAuth, requireAdmin, upload.single('image'), async (req, res) =>{
  try {
    const { id, name, price, quantity, old_url_image } = req.body;

    // Logic: Nếu có file mới thì dùng (S3), nếu không thì giữ lại old_url_image
    const imageUrl = req.file ? "https://via.placeholder.com/150_new" : old_url_image;

    const updatedItem = {
      id: id, // Lấy từ input hidden name="id"
      name: name,
      price: Number(price),
      quantity: Number(quantity),
      url_image: imageUrl,
      isDeleted: false
    };
    await productRepo.save(updatedItem, docClient);
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi cập nhật: " + err.message);
  }
});

// XÓA SẢN PHẨM
app.post('/delete/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    await productRepo.softDelete(req.params.id, docClient);
    await docClient.send(new PutCommand({
      TableName: "ProductLogs",
      Item: {
        logId: crypto.randomUUID(),
        productId: req.params.id,
        action: "DELETE",
        userId: req.session.user.id,
        time: new Date().toISOString()
      }
    }));
    res.redirect('/');
  } catch (err) { res.status(500).send(err.message); }
});

const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`🚀 Server Premium running on http://localhost:${PORT}`);
});