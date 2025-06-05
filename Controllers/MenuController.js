const MenuModal = require("../Model/MenuModel");

exports.menuCreation = async (req, res) => {
  try {
    const { userid, menu } = req.body;

    const _newMenu = new MenuModal({
      userid,
      menu,
    });

    const savedUser = await _newMenu.save();

    return res.status(201).json({
      status: "Success",
      message: "Menu created successfully",
      data: savedUser,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
      error: error.message || error,
    });
  }
};
