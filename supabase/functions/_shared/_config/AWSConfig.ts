import { S3Client } from "@aws-sdk/client-s3";

const REGION = Deno.env.get("AWS_REGION");
const ACCESS_KEY_ID = Deno.env.get("AWS_ACCESS_KEY_ID");
const SECRET_KEY = Deno.env.get("AWS_SECRET_ACCESS_KEY");

if (!REGION || !ACCESS_KEY_ID || !SECRET_KEY) {
  throw new Error("Missing AWS environment variables in Supabase");
}
// Environment variables are now available via Deno.env.get()
const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: ACCESS_KEY_ID ,
    secretAccessKey: SECRET_KEY
  },
});


export default s3;
