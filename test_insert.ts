import "dotenv/config";
import { getDb } from "./server/db.ts";
import { conversations } from "./drizzle/schema.ts";

async function testInsert() {
  try {
    const db = await getDb();
    await db.insert(conversations).values({
      sessionId: "test-session",
      messages: [{ role: "user", content: "test" }],
      extractedIntent: { is_complete: false },
      stage: "intent_extraction"
    });
    console.log("Insert successful!");
  } catch (err: any) {
    console.error("Insert failed:", err.message);
    if (err.cause) console.error("Cause:", err.cause);
  }
  process.exit(0);
}
testInsert();
