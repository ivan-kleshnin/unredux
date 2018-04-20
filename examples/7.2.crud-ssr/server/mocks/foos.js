import {Router} from "../express"

let router = Router({
  caseSensitive: true,
  strict: true
})

export default router

router.get(
  [
    "/foos/",
    "/foos",
  ],
  (req, res) => {
    res.status(200).send(`
      <a href="./">Current</a>
      <a href="../">Back</a>
    `)
  }
)
