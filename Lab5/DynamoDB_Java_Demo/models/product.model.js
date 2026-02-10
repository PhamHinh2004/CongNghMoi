const db = require('../config/db.config');
const TABLE_NAME = 'Products';

const Product = {
    getAll: async () => {
        const params = { TableName: TABLE_NAME };
        return await db.scan(params).promise();
    },
    save: async (product) => {
        const params = { TableName: TABLE_NAME, Item: product };
        return await db.put(params).promise();
    },
    update: async (id, updateData) => {
        const params = {
            TableName: TABLE_NAME,
            Key: { id },
            UpdateExpression: "set #n = :n, price = :p, url_image = :u",
            ExpressionAttributeNames: { "#n": "name" },
            ExpressionAttributeValues: {
                ":n": updateData.name,
                ":p": updateData.price,
                ":u": updateData.url_image
            }
        };
        return await db.update(params).promise();
    },

    delete: async (id) => {
        const params = {
            TableName: TABLE_NAME,
            Key: { id }
        };
        return await db.delete(params).promise();
    }

};
module.exports = Product;