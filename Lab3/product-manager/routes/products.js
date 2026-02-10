const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { ScanCommand, PutCommand, DeleteCommand, GetCommand, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

const db = require('../services/dynamodb');
const uploadImage = require('../services/s3');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// READ - Get all products
router.get('/', async (req, res) => {
  const data = await db.send(
    new ScanCommand({ TableName: 'Products' })
  );

  res.render("index", {
    products: data.Items
  });
});

// CREATE FORM
router.get("/add", (req, res) => res.render("add"));


// CREATE
router.post("/add", upload.single("image"), async (req, res) => {
  const imageUrl = await uploadImage(req.file);

  await db.send(new PutCommand({
    TableName: "Products",
    Item: {
      id: uuidv4(),
      name: req.body.name,
      price: Number(req.body.price),
      quantity: Number(req.body.quantity),
      url_image: imageUrl
    }
  }));

  res.redirect("/");
});

// DELETE
router.get("/delete/:id", async (req, res) => {
  await db.send(new DeleteCommand({
    TableName: "Products",
    Key: { id: req.params.id }
  }));
  res.redirect("/");
});

// UPDATE FORM
router.get("/edit/:id", async (req, res) => {
  const data = await db.send(
    new GetCommand({
      TableName: "Products",
      Key: { id: req.params.id }
    })
  );

  res.render("edit", { product: data.Item });
});


// UPDATE
router.post("/edit/:id", upload.single("image"), async (req, res) => {
  let imageUrl = req.body.oldImage;

  if (req.file) {
    imageUrl = await uploadImage(req.file);
  }

  await db.send(
    new UpdateCommand({
      TableName: "Products",
      Key: { id: req.params.id },
      UpdateExpression: `
        set #n = :name,
            price = :price,
            quantity = :quantity,
            url_image = :image
      `,
      ExpressionAttributeNames: {
        "#n": "name"
      },
      ExpressionAttributeValues: {
        ":name": req.body.name,
        ":price": Number(req.body.price),
        ":quantity": Number(req.body.quantity),
        ":image": imageUrl
      }
    })
  );

  res.redirect("/");
});

module.exports = router;