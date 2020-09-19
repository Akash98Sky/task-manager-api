import './db/mongoose'
import express from 'express'
import userRouter from './routers/user'
import taskRouter from './routers/task'

const app = express()
const port = process.env.PORT


app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on port ' + port)
});
