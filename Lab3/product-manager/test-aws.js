require("dotenv").config();
const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION });

(async () => {
  const data = await client.send(new ListTablesCommand({}));
  console.log(data.TableNames);
})();
