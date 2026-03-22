

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
import { Buffer } from 'buffer';
const AWS = require("aws-sdk");

// Textract & Bedrock 初期化
const textract = new AWS.Textract();
const bedrock = new AWS.BedrockRuntime({ region: "ap-northeast-1" });

exports.handler = async (event) => {
  try {
    const { imageBase64 } = JSON.parse(event.body || "{}");
    if (!imageBase64) {
      return { statusCode: 400, body: JSON.stringify({ error: "imageBase64 required" }) };
    }

    // Textract OCR
    const textractRes = await textract
      .analyzeDocument({
        Document: { Bytes: Buffer.from(imageBase64, "base64") },
        FeatureTypes: ["FORMS", "TABLES"],
      })
      .promise();

    const textBlocks = textractRes.Blocks?.filter(b => b.BlockType === "LINE").map(b => b.Text).join("\n") || "";

    // Bedrock Claude 3 Haiku でレシート解析
    const prompt = `
    以下のレシートテキストから JSON にしてください。
    {"storeName": "...", "total": ..., "date": "YYYY-MM-DD"}
    不明な場合は null
    レシートテキスト:
    ${textBlocks}
    `;

    const bedrockRes = await bedrock.invokeModel({
      modelId: "anthropic.claude-v3-haiku",
      body: JSON.stringify({ inputText: prompt }),
      contentType: "application/json",
    }).promise();

    // Bedrock の出力を JSON として返す
    const parsed = JSON.parse(bedrockRes.body);

    return {
      statusCode: 200,
      body: JSON.stringify(parsed),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
