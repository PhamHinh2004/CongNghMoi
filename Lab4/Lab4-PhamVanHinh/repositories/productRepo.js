const { ScanCommand, PutCommand, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

exports.getAllActive = async (docClient) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        // Lọc những sản phẩm chưa bị xóa mềm
        FilterExpression: "attribute_not_exists(isDeleted) OR isDeleted = :f",
        ExpressionAttributeValues: { ":f": false }
    };
    return await docClient.send(new ScanCommand(params));
};

exports.softDelete = async (id, docClient) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: { id: id },
        UpdateExpression: "set isDeleted = :t",
        ExpressionAttributeValues: { ":t": true }
    };
    return await docClient.send(new UpdateCommand(params));
};

exports.save = async (item, docClient) => {
    return await docClient.send(new PutCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: item
    }));
};