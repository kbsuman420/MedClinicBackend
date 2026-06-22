import express from "express"
import cors from "cors"

import clinicRouter from "./modules/clinics/clinic.route.js"


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))


app.use("/api/clinic", clinicRouter)




export default app