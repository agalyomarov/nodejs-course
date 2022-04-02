const { Router } = require("express");
const Course = require("../models/course");
const authMiddleware = require("../middleware/auth");
const { courseValidators } = require("../utils/validators");
const { validationResult } = require("express-validator");
const router = Router();

router.get("/", async(req, res) => {
    try {
        const courses = await Course.find()
            .populate("userId", "email name")
            .select("title img price")
            .lean();
        res.render("courses", {
            title: "Курсы",
            isCourses: true,
            userId: null,
            courses: courses,
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/:id", async(req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean();
        res.render("course", {
            layout: "empty",
            title: `Курс ${course.title}`,
            course,
        });
    } catch (err) {
        console.log(err);
    }
});

router.get("/:id/edit", authMiddleware, async(req, res) => {
    if (!req.query.allow) {
        return res.redirect("/");
    }
    try {
        const course = await Course.findById(req.params.id).lean();
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/courses");
        }
        res.render("course-edit", {
            title: `Редактировать ${course.title}`,
            course: course,
            error: req.flash("error"),
        });
    } catch (err) {
        console.log(err);
    }
});

router.post("/edit", authMiddleware, courseValidators, async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = errors.array()[0].msg;
        req.flash("error", error);
        return res.status(442).redirect(`/courses/${req.body.id}/edit?allow=true`);
    }
    try {
        const { id } = req.body;
        delete req.body.id;
        const course = await Course.findById(id);
        if (course.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/courses");
        }
        Object.assign(course, req.body);
        await course.save();
        res.redirect("/courses");
    } catch (err) {
        console.log(err);
    }
});

router.post("/remove", authMiddleware, async(req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id,
        });
        res.redirect("/courses");
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;