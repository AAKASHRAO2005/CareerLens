import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "./dynamodb.repo.js";
import { ApplicationRecord, ApplicationStatus } from "../types/backend.types.js";
import { UpdateApplicationInput } from "../schemas/application.schema.js";

export function encodeCursor(lastEvaluatedKey?: Record<string, unknown>): string | null {
  if (!lastEvaluatedKey) return null;
  return Buffer.from(JSON.stringify(lastEvaluatedKey)).toString("base64");
}

export function decodeCursor(cursor?: string): Record<string, unknown> | undefined {
  if (!cursor) return undefined;
  try {
    const raw = Buffer.from(cursor, "base64").toString("utf-8");
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export const ApplicationRepository = {
  async createApplication(record: ApplicationRecord): Promise<void> {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      })
    );
  },

  async getApplication(
    userId: string,
    applicationId: string
  ): Promise<ApplicationRecord | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `APP#${applicationId}`,
        },
      })
    );

    return (result.Item as ApplicationRecord) || null;
  },

  async listApplications(
    userId: string,
    status?: string,
    limit = 20,
    cursor?: string
  ): Promise<{ items: ApplicationRecord[]; nextCursor: string | null }> {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const exclusiveStartKey = decodeCursor(cursor);

    if (status && status !== "ALL") {
      // Query GSI1 for status-filtered applications
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :gsi1pk",
          ExpressionAttributeValues: {
            ":gsi1pk": `USER#${userId}#STATUS#${status}`,
          },
          ScanIndexForward: false, // Newest first
          Limit: safeLimit,
          ExclusiveStartKey: exclusiveStartKey,
        })
      );

      return {
        items: (result.Items as ApplicationRecord[]) || [],
        nextCursor: encodeCursor(result.LastEvaluatedKey),
      };
    } else {
      // Query GSI2 for all applications
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI2",
          KeyConditionExpression: "GSI2PK = :gsi2pk",
          ExpressionAttributeValues: {
            ":gsi2pk": `USER#${userId}#APPLICATIONS`,
          },
          ScanIndexForward: false, // Newest first
          Limit: safeLimit,
          ExclusiveStartKey: exclusiveStartKey,
        })
      );

      return {
        items: (result.Items as ApplicationRecord[]) || [],
        nextCursor: encodeCursor(result.LastEvaluatedKey),
      };
    }
  },

  async updateApplication(
    userId: string,
    applicationId: string,
    updates: UpdateApplicationInput,
    updatedAt: string
  ): Promise<ApplicationRecord | null> {
    const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
    const expressionAttributeNames: Record<string, string> = {
      "#updatedAt": "updatedAt",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressionAttributeValues: Record<string, any> = {
      ":updatedAt": updatedAt,
    };

    if (updates.companyName !== undefined) {
      updateExpressions.push("#companyName = :companyName");
      expressionAttributeNames["#companyName"] = "companyName";
      expressionAttributeValues[":companyName"] = updates.companyName;
    }

    if (updates.jobTitle !== undefined) {
      updateExpressions.push("#jobTitle = :jobTitle");
      expressionAttributeNames["#jobTitle"] = "jobTitle";
      expressionAttributeValues[":jobTitle"] = updates.jobTitle;
    }

    if (updates.jobDescription !== undefined) {
      updateExpressions.push("#jobDescription = :jobDescription");
      expressionAttributeNames["#jobDescription"] = "jobDescription";
      expressionAttributeValues[":jobDescription"] = updates.jobDescription;
    }

    if (updates.requiredSkills !== undefined) {
      updateExpressions.push("#requiredSkills = :requiredSkills");
      expressionAttributeNames["#requiredSkills"] = "requiredSkills";
      expressionAttributeValues[":requiredSkills"] = updates.requiredSkills;
    }

    if (updates.applicationDate !== undefined) {
      updateExpressions.push("#applicationDate = :applicationDate");
      expressionAttributeNames["#applicationDate"] = "applicationDate";
      expressionAttributeValues[":applicationDate"] = updates.applicationDate;
    }

    if (updates.notes !== undefined) {
      updateExpressions.push("#notes = :notes");
      expressionAttributeNames["#notes"] = "notes";
      expressionAttributeValues[":notes"] = updates.notes;
    }

    if (updates.status !== undefined) {
      updateExpressions.push("#status = :status");
      expressionAttributeNames["#status"] = "status";
      expressionAttributeValues[":status"] = updates.status;

      // Update GSI1 partition key to reflect new status!
      updateExpressions.push("#gsi1pk = :gsi1pk");
      expressionAttributeNames["#gsi1pk"] = "GSI1PK";
      expressionAttributeValues[":gsi1pk"] = `USER#${userId}#STATUS#${updates.status}`;
    }

    try {
      const result = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `APP#${applicationId}`,
          },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );

      return (result.Attributes as ApplicationRecord) || null;
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        return null;
      }
      throw err;
    }
  },

  async deleteApplication(userId: string, applicationId: string): Promise<boolean> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `APP#${applicationId}`,
          },
          ConditionExpression: "attribute_exists(PK)",
        })
      );
      return true;
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        return false;
      }
      throw err;
    }
  },
};
