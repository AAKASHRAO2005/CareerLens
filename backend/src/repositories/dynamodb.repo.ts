import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { UserProfileRecord } from "../types/backend.types.js";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "CareerLensData";

export const ProfileRepository = {
  async getProfile(userId: string): Promise<UserProfileRecord | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: "PROFILE",
        },
      })
    );

    return (result.Item as UserProfileRecord) || null;
  },

  async putProfile(record: UserProfileRecord): Promise<void> {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      })
    );
  },

  async updateProfile(
    userId: string,
    updates: { displayName?: string; skills?: string[] },
    updatedAt: string
  ): Promise<UserProfileRecord | null> {
    const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
    const expressionAttributeNames: Record<string, string> = {
      "#updatedAt": "updatedAt",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressionAttributeValues: Record<string, any> = {
      ":updatedAt": updatedAt,
    };

    if (updates.displayName !== undefined) {
      updateExpressions.push("#displayName = :displayName");
      expressionAttributeNames["#displayName"] = "displayName";
      expressionAttributeValues[":displayName"] = updates.displayName;
    }

    if (updates.skills !== undefined) {
      updateExpressions.push("#skills = :skills");
      expressionAttributeNames["#skills"] = "skills";
      expressionAttributeValues[":skills"] = updates.skills;
    }

    const result = await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: "PROFILE",
        },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return (result.Attributes as UserProfileRecord) || null;
  },
};
