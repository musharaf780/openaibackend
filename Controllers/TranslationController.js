const { HfInference } = require("@huggingface/inference");

const interface = new HfInference(process.env.HUGGING_FACE_TOKEN);

exports.translateToAribic = async (req, res) => {
  try {
    const { text } = req.body;
    const result = await interface.translation({
      inputs: text,
      model: "Helsinki-NLP/opus-mt-en-ar",
    });
    if (result) {
      return res.status(201).json({
        status: "Success",
        message: "Translate successfully",
        aribicText: result,
      });
    } else {
      return res.status(201).json({
        status: "Success",
        message: "Oops! something went wrong",
        aribicText: result,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};
