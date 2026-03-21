import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import cookieParser from "cookie-parser"

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀")
})



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})