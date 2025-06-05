const UserModal = require("../Model/UserAuthModel");
const jwt = require("jsonwebtoken");
exports.userRegistration = async (req, res) => {
  try {
    const existingUser = await UserModal.findOne({
      restaurantName: req.body.restaurantName,
    });

    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    const {
      firstName,
      lastName,
      restaurantName,
      cellNo,
      address,
      email,
      password,
    } = req.body;

    const _newUser = new UserModal({
      firstName,
      lastName,
      restaurantName,
      cellNo,
      address,
      email,
      password,
    });

    const savedUser = await _newUser.save();

    return res.status(201).json({
      status: "Success",
      message: "Customer created successfully",
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

exports.userSignIn = (req, res) => {
  UserModal.findOne({ email: req.body.email }).exec((error, user) => {
    if (error)
      return res.status(400).json({
        status: "error",
        error: error,
        message: "No user found",
      });

    if (user) {
      if (user.password === req.body.password) {
        const token = jwt.sign(
          { _id: user._id, role: user.role },
          process.env.JWT_SECRET
        );
        const {
          _id,
          firstName,
          lastName,
          restaurantName,
          cellNo,
          address,
          email,
          password,
        } = user;

        res.status(200).json({
          status: "Success",
          token,
          user: {
            _id,
            firstName,
            lastName,
            restaurantName,
            cellNo,
            address,
            email,
            password,
          },
        });
      } else {
        res.status(404).json({
          message: "Invalid password",
        });
      }
    } else {
      res.status(404).json({
        status: "Error",
        message: "Something went wrong",
      });
    }
  });
};
