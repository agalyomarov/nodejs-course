const { Router } = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/user");
const router = Router();

router.get("/", authMiddleware, async(req, res) => {
    res.render("profile", {
        title: "Profile",
        isProfile: true,
        user: req.user.toObject(),
    });
});

router.post("/", authMiddleware, async(req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        const toChange = {
            name: req.body.name,
        };
        if (req.file) {
            toChange.avatarUrl = req.file.path;
        }
        Object.assign(user, toChange);
        await user.save();
        res.redirect("/profile");
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;