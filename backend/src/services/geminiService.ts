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
    console.log("Initializing Gemini with key ending in:", apiKey.slice(-6));
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

    const filePath = path.join(process.cwd(), "public/uploads", filename);

    if (!fs.existsSync(filePath)) {
      console.log("AI search: Image file not found at:", filePath);
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
  // Use numeric indices instead of real IDs so Gemini never sees sensitive data
  const postsContext: string[] = [];
  const imageParts: Array<{ inlineData: { data: string; mimeType: string } }> =
    [];
  const imageLabels: string[] = [];
  const indexToId: Map<number, string> = new Map();

  for (let i = 0; i < posts.length; i++) {
    const p = posts[i];
    const postNum = i + 1;
    indexToId.set(postNum, p._id.toString());

    const senderName =
      typeof p.sender === "object" && p.sender !== null
        ? p.sender.userName || "Unknown"
        : "Unknown";
    const relatedComments = comments
      .filter((c) => c.postId.toString() === p._id.toString())
      .map((c) => {
        const cSender =
          typeof c.sender === "object" && c.sender !== null
            ? c.sender.userName || "Unknown"
            : "Unknown";
        return `  - Comment by ${cSender}: "${c.message}"`;
      })
      .join("\n");

    postsContext.push(
      `Post #${postNum} by ${senderName} (${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "unknown date"}):\n"${p.text}"\n${relatedComments ? "Comments:\n" + relatedComments : "No comments"}`,
    );

    // Try to load the post image (limit to 5 images to avoid rate limits)
    if (p.img && imageParts.length < 5) {
      const imageData = getImageAsBase64(p.img);
      if (imageData) {
        imageParts.push({
          inlineData: { data: imageData.base64, mimeType: imageData.mimeType },
        });
        imageLabels.push(
          `[Image above belongs to Post #${postNum}, text: "${p.text.substring(0, 50)}"]`,
        );
      } else {
        console.log("AI search: Could not load image for post:", p.img);
      }
    } else if (p.img) {
      postsContext[postsContext.length - 1] += "\n(This post has an image that was not included due to size limits)";
    }
  }

  console.log(`AI search: ${posts.length} posts, ${imageParts.length} images loaded, query: "${query}"`);

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
6. IMPORTANT: In your "answer" text, do NOT include any post numbers, internal IDs, or technical details. Write a natural, user-friendly summary that only references posts by their content or author name.
7. Return your response in the following JSON format ONLY (no markdown, no code fences):
{
  "answer": "Your helpful summary here (no post numbers or IDs)...",
  "relevantPostNumbers": [1, 2]
}

The "relevantPostNumbers" array should contain the post numbers (e.g. 1, 2, 3) of the relevant posts.
Return ONLY valid JSON, nothing else.`;

  // Build multipart request: text prompt, then each image with its label
  const parts: Array<
    { text: string } | { inlineData: { data: string; mimeType: string } }
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
      // Map post numbers back to real MongoDB IDs
      const relevantPostIds: string[] = (
        parsed.relevantPostNumbers ||
        parsed.relevantPostIds ||
        []
      )
        .map((num: number | string) => {
          const n = typeof num === "string" ? parseInt(num, 10) : num;
          return indexToId.get(n);
        })
        .filter(Boolean) as string[];

      return {
        answer: parsed.answer || "No relevant results found.",
        relevantPostIds,
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
