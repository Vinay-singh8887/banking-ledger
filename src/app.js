const express = require("express");
const cookieParser = require("cookie-parser");
const authrouter = require("./routes/auth.routes");
const accountrouter = require("./routes/account.routes");
const transactionrouter = require("./routes/transaction.routes");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authrouter);
app.use("/api/accounts", accountrouter);
app.use("/api/transactions", transactionrouter);
app.use("/api/accounts", accountrouter);
app.use("/api", transactionrouter);

module.exports = app;
