import mongoose, { Model, Document } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Task, { TaskSchema } from './task'

const userSchema = new mongoose.Schema<UserSchema>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value: string) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
            return true;
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value: string) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
            return true;
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value: number) {
            if (value < 0) {
                throw new Error('Age must be a postive number')
            }
            return true;
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

export interface UserSchema extends Document {
    name: string;
    email: string;
    password: string;
    age: number;
    tokens: { token: string }[];
    tasks?: TaskSchema[];
    avatar?: Buffer;
    generateAuthToken(): Promise<string>;
}

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET as string)

    user.tokens.push({ token })
    await user.save()

    return token
}

export interface UserModel extends Model<UserSchema> {
    findByCredentials(email: string, password: string): Promise<UserSchema>
}

userSchema.statics.findByCredentials = async (email: string, password: string) => {
    const user = await User.findOne({ email }).exec();

    if (!user) {
        throw new Error('Unable to login, User not found')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login, Password not match')
    }

    return user
}

// Hash the plain text password before saving
userSchema.pre<UserSchema>('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id }).exec();
    next()
})

const User = mongoose.model<UserSchema, UserModel>('User', userSchema)

export default User;