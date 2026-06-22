import "./loadenv.js";
import { dbConnect, pool } from "./database/index.js";




import app from "./app.js"

const port = process.env.PORT || 8000;

await dbConnect().then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })
}).catch((err) => {
    console.log("Database connection failed", err)
})



