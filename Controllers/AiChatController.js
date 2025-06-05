const { OpenAI } = require("openai");
require("dotenv").config();
const ChatMode = require("../Model/ChatModel");
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

exports.basicChat = async (req, res) => {
  const { userId, userMessage, _id } = req.body;

  let context = [];

  let chat = [];

  const existingConversation = await ChatMode.findOne({
    _id: _id,
  });

  if (!existingConversation) {
    context.push({
      role: "system",
      content: "Act like a restaurant owner",
    });

    try {
      const createChat = async () => {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: context,
        });

        const responseMessage = response.choices[0].message.content;
        chat.push({
          user: req.body.userMessage,
          ai: responseMessage,
        });

        const _newConversation = new ChatMode({
          userId: userId,
          context: context,
          chat: chat,
        });

        const savedChat = await _newConversation.save();
        return res.status(201).json({
          status: "Success",
          message: "Chat created successfully",
          responseMessage: responseMessage,
          data: savedChat,
        });
      };

      const userInput = userMessage.toString().trim();
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
  } else {
    context = existingConversation.context;
    chat = existingConversation.chat;

    try {
      const createChat = async () => {
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: context,
        });

        const responseMessage = response.choices[0].message.content;
        chat.push({
          user: req.body.userMessage,
          ai: responseMessage,
        });

        const data = await existingConversation.save();
        return res.status(201).json({
          status: "Success",
          message: "Chat Update successfully",
          responseMessage: responseMessage,
          data: data,
        });
      };

      const userInput = userMessage.toString().trim();
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
  }
};
