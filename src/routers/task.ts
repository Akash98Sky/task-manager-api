import express from 'express'
import Task from '../models/task'
import auth from '../middleware/auth'
const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: (req as any).user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=true
router.get('/tasks', auth, async (req, res) => {
    const match: { completed?: boolean } = {};
    const user = (req as any).user;

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    try {
        await user.populate({
            path: 'tasks',
            match
        }).execPopulate()
        res.send(user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    const user = (req as any).user;

    try {
        const task = await Task.findOne({ _id, owner: user._id }).exec();

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        const user = (req as any).user;
        const task = await Task.findOne({ _id: req.params.id, owner: user._id }).exec();

        if (!task) {
            return res.status(404).send()
        }

        task.set(req.body);
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const user = (req as any).user;

    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: user._id }).exec();

        if (!task) {
            res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

export default router;