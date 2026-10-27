import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "./dynamodb.repo.js";
import { InterviewRecord } from "../types/backend.types.js";
import { UpdateInterviewInput } from "../schemas/interview.schema.js";

export const InterviewRepository = {
  async createInterview(record: InterviewRecord): Promise<void> {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      })
    );
  },

  async getInterview(userId: string, interviewId: string): Promise<InterviewRecord | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `INTERVIEW#${interviewId}`,
        },
      })
    );

    return (result.Item as InterviewRecord) || null;
  },

  async listInterviews(
    userId: string,
    upcomingOnly = false,
    limit = 50
  ): Promise<InterviewRecord[]> {
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const nowIso = new Date().toISOString();

    if (upcomingOnly) {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI3",
          KeyConditionExpression: "GSI3PK = :gsi3pk AND GSI3SK >= :now",
          ExpressionAttributeValues: {
            ":gsi3pk": `USER#${userId}#INTERVIEWS`,
            ":now": nowIso,
          },
          ScanIndexForward: true, // Chronological: earliest upcoming first
          Limit: safeLimit,
        })
      );
      return (result.Items as InterviewRecord[]) || [];
    } else {
      const result = await docClient.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI3",
          KeyConditionExpression: "GSI3PK = :gsi3pk",
          ExpressionAttributeValues: {
            ":gsi3pk": `USER#${userId}#INTERVIEWS`,
          },
          ScanIndexForward: true, // Chronological
          Limit: safeLimit,
        })
      );
      return (result.Items as InterviewRecord[]) || [];
    }
  },

  async listInterviewsByApplication(
    userId: string,
    applicationId: string
  ): Promise<InterviewRecord[]> {
    const all = await this.listInterviews(userId, false, 50);
    return all.filter((int) => int.applicationId === applicationId);
  },

  async updateInterview(
    userId: string,
    interviewId: string,
    updates: UpdateInterviewInput,
    updatedAt: string
  ): Promise<InterviewRecord | null> {
    const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
    const expressionAttributeNames: Record<string, string> = {
      "#updatedAt": "updatedAt",
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressionAttributeValues: Record<string, any> = {
      ":updatedAt": updatedAt,
    };

    if (updates.roundName !== undefined) {
      updateExpressions.push("#roundName = :roundName");
      expressionAttributeNames["#roundName"] = "roundName";
      expressionAttributeValues[":roundName"] = updates.roundName;
    }

    if (updates.mode !== undefined) {
      updateExpressions.push("#mode = :mode");
      expressionAttributeNames["#mode"] = "mode";
      expressionAttributeValues[":mode"] = updates.mode;
    }

    if (updates.notes !== undefined) {
      updateExpressions.push("#notes = :notes");
      expressionAttributeNames["#notes"] = "notes";
      expressionAttributeValues[":notes"] = updates.notes;
    }

    if (updates.interviewDate !== undefined) {
      updateExpressions.push("#interviewDate = :interviewDate");
      expressionAttributeNames["#interviewDate"] = "interviewDate";
      expressionAttributeValues[":interviewDate"] = updates.interviewDate;

      // Update GSI3 sort key to maintain chronological query accuracy
      updateExpressions.push("#gsi3sk = :gsi3sk");
      expressionAttributeNames["#gsi3sk"] = "GSI3SK";
      expressionAttributeValues[":gsi3sk"] = `${updates.interviewDate}#INTERVIEW#${interviewId}`;
    }

    try {
      const result = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `INTERVIEW#${interviewId}`,
          },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
          ReturnValues: "ALL_NEW",
        })
      );

      return (result.Attributes as InterviewRecord) || null;
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        return null;
      }
      throw err;
    }
  },

  async deleteInterview(userId: string, interviewId: string): Promise<boolean> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `INTERVIEW#${interviewId}`,
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

  async deleteInterviewsByApplication(
    userId: string,
    applicationId: string
  ): Promise<number> {
    const linked = await this.listInterviewsByApplication(userId, applicationId);
    let deletedCount = 0;
    for (const int of linked) {
      const deleted = await this.deleteInterview(userId, int.interviewId);
      if (deleted) deletedCount++;
    }
    return deletedCount;
  },
};
