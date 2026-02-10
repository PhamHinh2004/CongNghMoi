package iuh.fit.config;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.dynamodb.DynamoDbClient;
import java.net.URI;

public class DynamoDBConfig {
    public static DynamoDbClient getClient() {
        return DynamoDbClient.builder()
                .endpointOverride(URI.create("http://localhost:8000")) // Trỏ về Docker
                .region(Region.US_WEST_2)
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create("local", "local"))) // Key giả như file Word yêu cầu
                .build();
    }
}