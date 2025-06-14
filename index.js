const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Initialize Express
const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

const UserRoute = require("./Router/UserAuthRoute");
const MenuRoute = require("./Router/MenuRoutes");
const AiChat = require("./Router/AiChatRouter");
const TranslateRoute = require("./Router/TranlsateRoutes");

// Test API
app.get("/", (req, res) => {
  res.send("API works fine.");
});

app.use("/user/", UserRoute);
app.use("/menu/", MenuRoute);
app.use("/aiChat/", AiChat);
app.use("/translate/", TranslateRoute);

// Database Connection
mongoose.set("strictQuery", false);

const dbURI = `mongodb+srv://musharafahmed780:${process.env.MongoDBPassword}@cluster0.zpmq3cl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose
  .connect(dbURI)
  .then(() => console.log("Database is connected"))
  .catch((err) => console.error("Database connection error:", err));

// Start Server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
  console.log(`Server is running on Port # ${PORT}`);
});
