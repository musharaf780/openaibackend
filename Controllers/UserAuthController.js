const UserModal = require("../Model/UserAuthModel");

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

    const { firstName, lastName, restaurantName, cellNo, address } = req.body;

    const _newUser = new UserModal({
      firstName,
      lastName,
      restaurantName,
      cellNo,
      address,
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

// exports.getAllCustomer = (req, res) => {
//     CustomerModal.find({}, (error, customer) => {
//         if (customer) {
//             res.status(200).json({
//                 status: "Success",
//                 message: "Get All Board Successfully",
//                 data: customer,
//             })
//         } else {
//             res.status(400).json({
//                 status: "Error",
//                 message: "Something Went Wrong",

//             })
//         }
//     })
// }

// exports.updateCustomerInfo = async (req, res) => {
//     const customerId = req.body.id;
//     const {
//         firstName,
//         lastName,
//         bussinessName,
//         address,
//         maxLimit,
//         number,

//     } = req.body;

//     CustomerModal.findOneAndUpdate(
//         { _id: customerId },
//         {
//             firstName: firstName,
//             lastName: lastName,
//             bussinessName: bussinessName,
//             address: address,
//             maxLimit: maxLimit,
//             number: number,

//         },
//         { new: true },
//         (error, data) => {
//             if (data) {
//                 return res.status(200).json({
//                     status: "Success",
//                     data: data,
//                 });
//             } else {
//                 return res.status(400).json({
//                     status: 400,
//                     message: "Something went wrong",
//                 });
//             }
//         }
//     );

// };
