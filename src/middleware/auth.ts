import jwt from 'jsonwebtoken'
import User from '../models/user'

export default async (req: any, res: any, next: any) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token, 'thisismynewcourse') as { _id: any }
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }).exec();

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' })
    }
}
