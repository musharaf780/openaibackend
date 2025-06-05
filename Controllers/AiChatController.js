const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

exports.basicChat = async (req, res) => {
  try {
    const context = [
      {
        role: "system",
        content: "Act like a restaurant owner",
      },
    ];

    const chat = [];
    const createChat = async () => {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: context,
      });

      const responseMessage = response.choices[0].message.content;
      chat.push({
        userId: Math.random(),
        user: req.body.userMessage,
        ai: responseMessage,
      });
      return res.status(201).json({
        status: "Success",
        message: "Chat created successfully",
        responseMessage: responseMessage,
        context: context,
        chat: chat,
      });
    };

    const userInput = req.body.userMessage.toString().trim();
    if (!userInput) return;

    context.push({
      role: "user",
      content: userInput,
    });

    await createChat();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};
