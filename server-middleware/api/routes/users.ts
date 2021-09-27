import express from 'express'
import DbService from '../services/DbService'

const router = express.Router()

const db = new DbService()

router.get('/:id', async (req, res, next) => {
  const { id } = req.params

  try {
    const user = await db.getUserById(id)
    if (!user) {
      return res.status(404).send('Not found')
    }
    res.json(user)
  } catch (err) {
    return next(err)
  }
})

export default router
