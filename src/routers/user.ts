import express from 'express'
import User, { UserSchema } from '../models/user'
import auth from '../middleware/auth'

const router = express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    const user = (req as any).user as UserSchema;
    try {
        user.tokens.splice(user.tokens.findIndex((value) => value.token === (req as any).token), 1);
        await user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    const user = (req as any).user as UserSchema;
    try {
        user.tokens = []
        await user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req, res) => {
    const user = (req as any).user as UserSchema;
    res.send(user)
})

router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = (req as any).user as UserSchema;
        
        user.set(req.body)
        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    const user = (req as any).user as UserSchema;

    try {
        await user.remove()
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

export default router;