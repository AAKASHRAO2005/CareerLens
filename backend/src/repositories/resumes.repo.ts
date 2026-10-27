import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient, TABLE_NAME } from "./dynamodb.repo.js";
import { ResumeRecord, ResumeStatus } from "../types/backend.types.js";

export const s3Client = new S3Client({});
export const RESUME_BUCKET = process.env.S3_RESUME_BUCKET || "careerlens-resumes-bucket";

export const ResumeRepository = {
  /**
   * Generates a short-lived presigned URL for direct secure PUT to S3
   */
  async createPresignedUploadUrl(
    s3Key: string,
    contentType: string,
    expiresIn = 900 // 15 minutes
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: RESUME_BUCKET,
      Key: s3Key,
      ContentType: contentType,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  },

  /**
   * Generates a short-lived presigned URL for secure GET from private S3 bucket
   */
  async createPresignedDownloadUrl(
    s3Key: string,
    expiresIn = 300 // 5 minutes
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: RESUME_BUCKET,
      Key: s3Key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
  },

  /**
   * Verifies that the object exists in S3 and inspects actual metadata
   */
  async headS3Object(
    s3Key: string
  ): Promise<{ contentLength?: number; contentType?: string } | null> {
    try {
      const res = await s3Client.send(
        new HeadObjectCommand({
          Bucket: RESUME_BUCKET,
          Key: s3Key,
        })
      );
      return {
        contentLength: res.ContentLength,
        contentType: res.ContentType,
      };
    } catch {
      return null;
    }
  },

  /**
   * Permanently deletes resume object from private S3 bucket
   */
  async deleteS3Object(s3Key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: RESUME_BUCKET,
        Key: s3Key,
      })
    );
  },

  /**
   * Writes initial or updated resume metadata into single-table DynamoDB
   */
  async saveResumeMetadata(record: ResumeRecord): Promise<void> {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      })
    );
  },

  /**
   * Fetches resume metadata scoped strictly to user's PK
   */
  async getResumeMetadata(
    userId: string,
    resumeId: string
  ): Promise<ResumeRecord | null> {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `RESUME#${resumeId}`,
        },
      })
    );
    return (result.Item as ResumeRecord) || null;
  },

  /**
   * Lists all resume metadata records for authenticated candidate
   */
  async listResumeMetadata(userId: string): Promise<ResumeRecord[]> {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :skPrefix)",
        ExpressionAttributeValues: {
          ":pk": `USER#${userId}`,
          ":skPrefix": "RESUME#",
        },
      })
    );
    return (result.Items as ResumeRecord[]) || [];
  },

  /**
   * Atomically updates resume upload status (e.g. from PENDING_UPLOAD to READY)
   */
  async updateResumeStatus(
    userId: string,
    resumeId: string,
    status: ResumeStatus,
    sizeBytes: number,
    updatedAt: string
  ): Promise<ResumeRecord | null> {
    try {
      const result = await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `RESUME#${resumeId}`,
          },
          UpdateExpression:
            "SET #status = :status, #sizeBytes = :sizeBytes, #updatedAt = :updatedAt",
          ConditionExpression: "attribute_exists(PK)",
          ExpressionAttributeNames: {
            "#status": "status",
            "#sizeBytes": "sizeBytes",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":status": status,
            ":sizeBytes": sizeBytes,
            ":updatedAt": updatedAt,
          },
          ReturnValues: "ALL_NEW",
        })
      );
      return (result.Attributes as ResumeRecord) || null;
    } catch (err: any) {
      if (err.name === "ConditionalCheckFailedException") {
        return null;
      }
      throw err;
    }
  },

  /**
   * Deletes resume metadata record from DynamoDB with ownership condition check
   */
  async deleteResumeMetadata(userId: string, resumeId: string): Promise<boolean> {
    try {
      await docClient.send(
        new DeleteCommand({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${userId}`,
            SK: `RESUME#${resumeId}`,
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
