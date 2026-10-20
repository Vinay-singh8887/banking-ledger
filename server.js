require('dotenv').config();

const app = require('./src/app');

const connectdb = require('./src/config/db');

connectdb();
 
app.listen(3000, () => {
    console.log("Server running on port 3000 🔥")
});