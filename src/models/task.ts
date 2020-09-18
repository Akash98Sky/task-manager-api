import mongoose, { Document } from 'mongoose'

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

export interface TaskSchema extends Document {
    description: string,
    completed: boolean,
    owner: mongoose.Schema.Types.ObjectId,
}

const Task = mongoose.model<TaskSchema>('Task', taskSchema)

export default Task;