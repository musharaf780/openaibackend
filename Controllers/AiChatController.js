const { OpenAI } = require("openai");
require("dotenv").config();
const ChatMode = require("../Model/ChatModel");

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

exports.basicChat = async (req, res) => {
  const { userId, userMessage, _id } = req.body;

  const userInput = userMessage?.toString().trim();
  if (!userInput) {
    return res
      .status(400)
      .json({ status: "error", message: "User message is required" });
  }

  function parseResponse(responseMessage) {
    try {
      return JSON.parse(responseMessage);
    } catch {
      return responseMessage;
    }
  }

  const lowerMessage = userInput.toLowerCase();

  // Check if the current input is a menu generation request
  const isMenuRequest =
    lowerMessage.includes("add menu") ||
    lowerMessage.includes("generate menu") ||
    lowerMessage.includes("create menu");

  // Define system prompt for normal chat
  const defaultSystemPrompt = {
    role: "system",
    content: "Act like a restaurant owner",
  };

  // Define system prompt for menu generation
  const menuSystemPrompt = {
    role: "system",
    content: `You are an assistant that ONLY returns valid JSON arrays for restaurant menus — nothing else.

IMPORTANT:
- DO NOT include any text, explanations, greetings, or commentary.
- Output must be a valid JSON array only.
- No headings, no bullet points, no markdown — just raw JSON.

The required format is:

[
  {
    "categoryName": "Category Name",
    "imageUrl": "Category Image URL (any open source url that show Category .png)",
    "menuItems": [
      {
        "name": "Dish Name",
         "imageUrl": "Dish Image URL (any open source url that show Dish .png)",
        "price": Dish Price (number only, no currency symbols),
        "description":"Dish short description in 150 words",
        "calories":"Dish average calories (number only)"
      }
    ]
  }
]

Instructions:
- Include 2–4 categories (e.g., Breakfast, Lunch, Dinner, Desserts, Drinks).
- Each category must have 2–4 menu items.
- Use realistic dishes based on the cuisine requested by the user.
- Use Unsplash image URLs.
- Prices must be realistic numbers.
- Adapt food types to match the country or region if specified (e.g., halal in UAE).
- Do NOT return anything except the JSON array.
- The output MUST be valid JSON that can be parsed directly.
- Make sure the response is exactly in this format [
  {
    "categoryName": "Category Name",
    "imageUrl": "Category Image URL (any open source url that show Category .png)",
    "menuItems": [
      {
        "name": "Dish Name",
        "imageUrl": "Dish Image URL (any open source url that show Dish .png)",
        "price": Dish Price (number only, no currency symbols)
          "description":"Dish short description in 150 words",
        "calories":"Dish average calories (number only)"
      }
    ]
  }
]
`,
  };

  try {
    let conversation = await ChatMode.findOne({ _id });

    if (!conversation) {
      conversation = new ChatMode({
        userId,
        context: [defaultSystemPrompt],
        chat: [],
      });
    }

    let messages;

    if (isMenuRequest) {
      // Start fresh context only for menu generation
      messages = [menuSystemPrompt, { role: "user", content: userInput }];
    } else {
      // Continue existing conversation
      conversation.context.push({ role: "user", content: userInput });
      messages = conversation.context;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const responseMessage = response.choices[0].message.content;

    // Store the new exchange
    conversation.chat.push({
      user: userInput,
      ai: parseResponse(responseMessage),
    });

    if (!isMenuRequest) {
      // Only update context if this is NOT a menu request
      conversation.context = messages;
    }

    const savedConversation = await conversation.save();

    const message =
      _id && conversation._id.equals(_id)
        ? "Chat updated successfully"
        : "Chat created successfully";

    return res.status(201).json({
      status: "Success",
      message,
      responseMessage,
      data: savedConversation,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};
