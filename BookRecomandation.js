require("dotenv").config();
const { OpenAI } = require("openai");
const { Pinecone } = require("@pinecone-database/pinecone");

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINE_CONE_KEY });
const indexName = "Food-Recomandation";
const region = process.env.PINECONE_REGION;

async function createIndexIfNotExists() {
  const list = await pinecone.listIndexes();

  const indexNames = Array.isArray(list)
    ? list
    : Array.isArray(list.indexes)
    ? list.indexes.map((i) => (typeof i === "string" ? i : i.name))
    : [];

  const exists = indexNames.includes(indexName);

  if (!exists) {
    await pinecone.createIndex({
      name: indexName,
      dimension: 1536,
      metric: "cosine",
      spec: {
        serverless: {
          cloud: "aws", // or "gcp"
          region: region,
        },
      },
    });
    console.log("✅ Index created:", indexName);
  } else {
    console.log("ℹ️ Index already exists:", indexName);
  }
}
// Get embedding from OpenAI
async function getEmbedding(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

async function upsertBooks(index) {
  const books = [
    {
      id: "1",
      title: "The Hobbit",
      description: "A fantasy adventure in Middle-earth",
    },
    {
      id: "2",
      title: "1984",
      description: "A dystopian novel about totalitarian regime",
    },
    {
      id: "3",
      title: "The Catcher in the Rye",
      description: "A story of teenage angst and alienation",
    },
    {
      id: "4",
      title: "Fisty Shades of gray",
      description: "The lust, and based on sex",
    },
  ];

  const vectors = await Promise.all(
    books.map(async (book) => {
      const embedding = await getEmbedding(book.description);
      return {
        id: book.id,
        values: embedding,
        metadata: {
          title: book.title,
          description: book.description,
        },
      };
    })
  );

  await index.upsert(vectors);
  console.log("📚 Book vectors upserted.");
}

// Recommend similar books
async function recommendBooks(index, queryText) {
  const embedding = await getEmbedding(queryText);
  const result = await index.query({
    vector: embedding,
    topK: 1,
    includeMetadata: true,
  });

  console.log("\n🔍 Recommended books:");
  result.matches.forEach((match) => {
    console.log(`- ${match.metadata.title} (Score: ${match.score.toFixed(2)})`);
  });
}

// Main runner
(async () => {
  try {
    await createIndexIfNotExists();

    // Wait for index to be ready
    const index = pinecone.Index(indexName);

    await upsertBooks(index); // Comment this after first run
    await recommendBooks(index, "I want a book that bases on sex");
  } catch (err) {
    console.error(" Error:", err);
  }
})();
