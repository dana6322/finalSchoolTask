import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import fs from "fs";
import path from "path";

let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment variables");
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return model;
}

/**
 * Reads an image from disk given a post's img URL and returns base64 + mimeType.
 * Post img URLs look like: "http://localhost:3000/uploads/1773482562979.png"
 */
function getImageAsBase64(
  imgUrl: string,
): { base64: string; mimeType: string } | null {
  try {
    // Extract filename from URL (e.g. "http://localhost:3000/uploads/file.png" -> "file.png")
    let filename: string;
    if (imgUrl.startsWith("http")) {
      const url = new URL(imgUrl);
      const parts = url.pathname.split("/");
      filename = parts[parts.length - 1];
    } else {
      const parts = imgUrl.split("/");
      filename = parts[parts.length - 1];
    }

    const filePath = path.join(__dirname, "../../public/uploads", filename);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const buffer = fs.readFileSync(filePath);
    const base64 = buffer.toString("base64");

    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
    };
    const mimeType = mimeMap[ext] || "image/jpeg";

    return { base64, mimeType };
  } catch {
    return null;
  }
}

/**
 * Uses Gemini to perform intelligent search over application content.
 * Sends post text, comments, AND post images to Gemini so it can
 * understand what's in the images (e.g. movie posters, photos, etc.).
 */
export async function smartSearch(
  query: string,
  posts: Array<{
    _id: string;
    text: string;
    img: string;
    sender: { userName?: string; _id: string } | string;
    createdAt?: string;
  }>,
  comments: Array<{
    _id: string;
    message: string;
    postId: string;
    sender: { userName?: string; _id: string } | string;
    createdAt?: string;
  }>,
): Promise<{
  answer: string;
  relevantPostIds: string[];
}> {
  // Build text context and collect images
  const postsContext: string[] = [];
  const imageParts: Array<{ inlineData: { data: string; mimeType: string } }> =
    [];
  const imageLabels: string[] = [];

  for (const p of posts) {
    const senderName =
      typeof p.sender === "object" ? p.sender.userName || "Unknown" : "Unknown";
    const relatedComments = comments
      .filter((c) => c.postId.toString() === p._id.toString())
      .map((c) => {
        const cSender =
          typeof c.sender === "object"
            ? c.sender.userName || "Unknown"
            : "Unknown";
        return `  - Comment by ${cSender}: "${c.message}"`;
      })
      .join("\n");

    postsContext.push(
      `Post [ID: ${p._id}] by ${senderName} (${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "unknown date"}):\n"${p.text}"\n${relatedComments ? "Comments:\n" + relatedComments : "No comments"}`,
    );

    // Try to load the post image
    if (p.img) {
      const imageData = getImageAsBase64(p.img);
      if (imageData) {
        imageParts.push({
          inlineData: { data: imageData.base64, mimeType: imageData.mimeType },
        });
        imageLabels.push(
          `[Image above belongs to Post ID: ${p._id}, text: "${p.text.substring(0, 50)}"]`,
        );
      }
    }
  }

  const textPrompt = `You are a helpful assistant for a social media application called SocialHub.
Users can create posts with text and images, and other users can comment on them.

Here is the current content in the application:

${postsContext.join("\n\n---\n\n")}

${imageLabels.length > 0 ? "\nThe following images are attached (in order):\n" + imageLabels.join("\n") : ""}

---

The user is searching for: "${query}"

Instructions:
1. Find posts and comments that are relevant to the user's search query.
2. Also analyze the attached images — if an image shows something relevant to the query (e.g. a movie poster, a specific scene, text in the image), include that post.
3. Provide a helpful, concise summary answering the user's query based on the application content.
4. If the search is about a topic, summarize what the community has discussed about it.
5. If no relevant content is found, say so politely.
6. Return your response in the following JSON format ONLY (no markdown, no code fences):
{
  "answer": "Your helpful summary here...",
  "relevantPostIds": ["id1", "id2"]
}

The "relevantPostIds" array should contain the IDs of posts that are relevant to the search.
Return ONLY valid JSON, nothing else.`;

  // Build multipart request: text prompt, then each image with its label
  const parts: Array<
    | { text: string }
    | { inlineData: { data: string; mimeType: string } }
  > = [{ text: textPrompt }];

  for (let i = 0; i < imageParts.length; i++) {
    parts.push({ text: imageLabels[i] });
    parts.push(imageParts[i]);
  }

  const result = await getModel().generateContent(parts);
  const response = result.response;
  const text = response.text().trim();

  // Parse the JSON response from Gemini
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        answer: parsed.answer || "No relevant results found.",
        relevantPostIds: parsed.relevantPostIds || [],
      };
    }
  } catch {
    // If JSON parsing fails, return the raw text as the answer
  }

  return {
    answer: text,
    relevantPostIds: [],
  };
}
