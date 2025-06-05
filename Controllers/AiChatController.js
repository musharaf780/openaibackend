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

  try {
    let conversation = await ChatMode.findOne({ _id });

    if (!conversation) {
      conversation = new ChatMode({
        userId,
        context: [{ role: "system", content: "Act like a restaurant owner" }],
        chat: [],
      });
    }

    conversation.context.push({ role: "user", content: userInput });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: conversation.context,
    });

    const responseMessage = response.choices[0].message.content;

    conversation.chat.push({
      user: userInput,
      ai: responseMessage,
    });

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
