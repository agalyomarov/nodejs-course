const { Router } = require("express");
const Course = require("../models/course");
const authMiddleware = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");
const { validationResult } = require("express-validator");
const router = Router();
router.get("/", authMiddleware, (req, res) => {
    res.render("add", {
        title: "Добавить курс",
        isAdd: true,
    });
});
router.post("/", authMiddleware, courseValidators, async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(442).render("add", {
            title: "Добавить курс",
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                img: req.body.img,
            },
        });
    }
    const course = await new Course({
        title: req.body.title,
        price: req.body.price,
        img: req.body.img,
        userId: req.user,
    });
    try {
        await course.save();
        res.redirect("/courses");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;