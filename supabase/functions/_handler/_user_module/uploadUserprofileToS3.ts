import { USERMODULE } from "@shared/_messages/userModuleMessages.ts";
import { HTTP_STATUS_CODE } from "@shared/_constants/HttpStatusCodes.ts";
import ErrorResponse, { SuccessResponse } from "@response/Response.ts";

import {PutObjectCommand } from "@aws-sdk/client-s3";

import { Buffer } from "node:buffer";
import s3 from "@shared/_config/AWSConfig.ts";

// Upload profile photo to AWS S3
export async function uploadUserProfilePhotoToAWSS3(
  req: Request,
  _params: Record<string, string>
): Promise<Response> {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return ErrorResponse(
        HTTP_STATUS_CODE.BAD_REQUEST,
        "Expected multipart/form-data"
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !(file instanceof File)) {
      return ErrorResponse(
        HTTP_STATUS_CODE.BAD_REQUEST,
        "File is missing or invalid in form-data"
      );
    }

    const fileName = file.name;
    // const contentType = file.type || "application/octet-stream";
    const bucketName = "userprofiles2025";
    const key = `uploads/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: buffer,
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
