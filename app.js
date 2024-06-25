require('dotenv').config()
require('express-async-errors')
const express = require('express')
const cors = require('cors')
const app = express()
const helmet = require('helmet')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

// error handler
const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')

const connectDB = require('./db/connect')
const authenticateUser = require('./middleware/authentication')

//router
const authRouter = require('./routes/auth')

const messageRouter = require('./routes/message')
const friendRequest = require('./routes/friendRequest')
const searchForFriend = require('./routes/search')

// extra packages
app.set('trust proxy', 1)
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 200, //max 200 request per "15 minutes"
    })
)
app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())

// routes
app.get('/', (req, res) => {
    res.json({ msg: 'The Back-end is live' })
})

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/search', authenticateUser, searchForFriend)
app.use('/api/v1/message', authenticateUser, messageRouter)
app.use('/api/v1/friends', authenticateUser, friendRequest)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        )
    } catch (error) {
        console.log(error)
    }
}

start()
