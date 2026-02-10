const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION
});

module.exports = async (file) => {
  if (!file) throw new Error("File is undefined");

  const key = `products/${Date.now()}-${file.originalname}`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,                 // ✅ BẮT BUỘC
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
