import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";

import * as fs from "node:fs";
import * as path from "node:path";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import process from "node:process";

// Create and configure S3 client
const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  },
});

// Helper: Get MIME type based on file extension
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

// Upload profile photo to AWS S3
export async function uploadUserProfilePhotoToAWSS3(
  req: Request,
  _params: Record<string, string>
): Promise<Response> {
  try {
    const { filePath, fileName }: { filePath: string; fileName: string } = await req.json();

    // Validate input
    if (!filePath || !fileName) {
      return ErrorResponse(
        HTTP_STATUS_CODE.BAD_REQUEST,
        "Missing filePath or fileName"
      );
    }

    const bucketName = "userprofiles2025";
    const key = `uploads/${fileName}`;

    // Check file existence before reading
    if (!fs.existsSync(filePath)) {
      return ErrorResponse(
        HTTP_STATUS_CODE.BAD_REQUEST,
        `File does not exist at path: ${filePath}`
      );
    }

    const fileStream = fs.createReadStream(filePath);
    const contentType = getMimeType(filePath);

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    return SuccessResponse("Image uploaded successfully", HTTP_STATUS_CODE.OK);
  } catch (error) {
    console.error("S3 Upload Error:", error);
    return ErrorResponse(
      HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      USERMODULE.INTERNAL_SERVER_ERROR
    );
  }
}
