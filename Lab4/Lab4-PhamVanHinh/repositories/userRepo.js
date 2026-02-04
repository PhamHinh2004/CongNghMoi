const { GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");

exports.findByUsername = async (username, docClient) => {
    const params = {
        TableName: process.env.DYNAMODB_TABLE_USERS,
        FilterExpression: "username = :u",
        ExpressionAttributeValues: { ":u": username }
    };
    const data = await docClient.send(new ScanCommand(params));
    return data.Items[0]; // Trả về user đầu tiên tìm thấy
};