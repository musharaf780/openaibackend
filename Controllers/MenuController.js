const MenuModel = require("../Model/MenuModel");

const { OpenAI } = require("openai");
const { Pinecone } = require("@pinecone-database/pinecone");
const { v4: uuidv4 } = require("uuid");

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });
const pinecone = new Pinecone({ apiKey: process.env.PINE_CONE_KEY });

const indexName = "food-recomandation";
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
          cloud: "aws",
          region,
        },
      },
    });
    console.log("✅ Index created:", indexName);
  } else {
    console.log("ℹ️ Index already exists:", indexName);
  }
}

// Run once during server startup
createIndexIfNotExists();

async function getEmbedding(text) {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return res.data[0].embedding;
}

function flattenMenuItems(menu) {
  if (!Array.isArray(menu)) return [];

  return menu.flatMap((category) => category.menuItems);
}
async function upsertBooks(index, menu) {
  const menuItems = flattenMenuItems(menu);

  const vectors = await Promise.all(
    menuItems.map(async (item) => {
      const embedding = await getEmbedding(item.description);
      return {
        id: uuidv4(),
        values: embedding,
        metadata: {
          name: item.name,
          price: String(item.price),
          calories: String(item.calories),
          description: item.description,
        },
      };
    })
  );

  await index.upsert(vectors);
  console.log("📚 Book vectors upserted.");
}

exports.menuCreation = async (req, res) => {
  try {
    const { userid, menu } = req.body;
    const index = pinecone.Index(indexName);

    await upsertBooks(index, menu);

    const _newMenu = new MenuModel({ userid, menu });

    const savedUser = await _newMenu.save();

    console.log("✅ Menu saved!");

    return res.status(201).json({
      status: "Success",
      message: "Menu created successfully",
      data: savedUser,
    });
  } catch (error) {
    console.error("❌ Error in menuCreation:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};

exports.foodRecomandation = async (req, res) => {
  try {
    const { query } = req.body;

    async function recommendFood(queryText) {
      const index = pinecone.Index(indexName);
      const embedding = await getEmbedding(queryText);
      const result = await index.query({
        vector: embedding,
        topK: 2,
        includeMetadata: true,
      });

      let foodList = [];
      if (result) {
        const data = result.matches;
        for (const key in data) {
          foodList.push({
            id: data[key].id,
            score: data[key].score,
            data: data[key].metadata,
          });
        }

        return res.status(201).json({
          status: "Success",
          message: "Food fetch successfully",
          food: foodList,
        });
      } else {
        return res.status(400).json({
          status: "error",
          message: "Something went wrong",
        });
      }

      console.log(result.matches);
    }

    recommendFood(query);
  } catch (error) {
    console.error("❌ Error in menuCreation:", error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};
