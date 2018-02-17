import {Router} from "../express"

let router = Router({
  caseSensitive: true,
  strict: true
})

export default router

router.get("/landing", (req, res) => {
  res.status(200).send("landing!")
})

router.get("/301", (req, res) => {
  res.redirect(301, "/foos/landing")
})

router.get("/302", (req, res) => {
  res.redirect(302, "/foos/landing")
})

router.get("/404", (req, res) => {
  res.status(404).send("404")
})

router.get("/500", (req, res) => {
  res.status(500).send("500")
})
