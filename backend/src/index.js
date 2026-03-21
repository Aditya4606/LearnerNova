import express from "express"
import cors from "cors"
import dotenv from "dotenv"
dotenv.config()
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import courseRoutes from "./routes/course.routes.js"
import uploadRoutes from "./routes/upload.routes.js"
import lessonRoutes from "./routes/lesson.routes.js"
import learnerRoutes from "./routes/learner.routes.js"
import quizRoutes from "./routes/quiz.routes.js"
import reportingRoutes from "./routes/reporting.routes.js"
import reviewRoutes from "./routes/review.routes.js"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Test route
app.get("/", (req, res) => {
  res.send("API is running 🚀")
})



app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/courses", courseRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/lessons", lessonRoutes)
app.use("/api/learner", learnerRoutes)
app.use("/api/quizzes", quizRoutes)
app.use("/api/reporting", reportingRoutes)
app.use("/api/reviews", reviewRoutes)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})