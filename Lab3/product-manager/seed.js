require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("./services/dynamodb");

const products = [
  {
    id: uuidv4(),
    name: "iPhone 15 Pro Max",
    price: 32000000,
    quantity: 10,
    url_image: "https://product-images-phamhinh-2026.s3.ap-southeast-1.amazonaws.com/products/iphone15.jpg"
  },
  {
    id: uuidv4(),
    name: "Samsung Galaxy S24 Ultra",
    price: 28000000,
    quantity: 8,
    url_image: "https://product-images-phamhinh-2026.s3.ap-southeast-1.amazonaws.com/products/s24.jpg"
  },
  {
    id: uuidv4(),
    name: "Xiaomi 14 Pro",
    price: 19000000,
    quantity: 12,
    url_image: "https://product-images-phamhinh-2026.s3.ap-southeast-1.amazonaws.com/products/xiaomi14.jpg"
  }
];

async function seed() {
  for (const product of products) {
    await db.send(new PutCommand({
      TableName: "Products",
      Item: product
    }));
    console.log("✅ Added:", product.name);
  }

  console.log("🎉 Seeding completed!");
}

seed().catch(console.error);
