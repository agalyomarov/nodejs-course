const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const keys = require("../keys");
const regEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");
const { validationResult } = require("express-validator");
const { registerValidators, loginValidators } = require("../utils/validators");
const crypto = require("crypto");
const router = Router();
const transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "6e9d36372cfa25",
        pass: "e6f22a218257e4",
    },
});
router.get("/login", async(req, res) => {
    res.render("auth/login", {
        isLogin: true,
        title: "Авторизация",
        loginError: req.flash("loginError"),
        registerError: req.flash("registerError"),
    });
});

router.post("/login", loginValidators, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("loginError", errors.array()[0].msg);
            return res.status(442).redirect("/auth/login#login");
        }
        const { email, password } = req.body;
        const candidate = await User.findOne({ email });
        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);
            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if (err) throw new Error(err);
                    res.redirect("/");
                });
            } else {
                req.flash("loginError", "Не верный парол");
                res.redirect("/auth/login#login");
            }
        } else {
            req.flash("loginError", "Ползовател с email не найден");
            res.redirect("/auth/login#login");
        }
    } catch (err) {
        if (err) {
            console.log(err);
        }
    }
});

router.post("/register", registerValidators, async(req, res) => {
    try {
        const { email, password, name } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash("registerError", errors.array()[0].msg);
            return res.status(442).redirect("/auth/login#register");
        }
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            name,
            password: hashPassword,
            cart: { items: [] },
        });
        await user.save();
        res.redirect("/auth/login#login");
        await transporter.sendMail(regEmail(email));
    } catch (err) {
        if (err) throw new Error(err);
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

router.get("/reset", (req, res) => {
    res.render("auth/reset", {
        title: "Забыли парол?",
        error: req.flash("error"),
    });
});

router.post("/reset", (req, res) => {
    try {
        crypto.randomBytes(32, async(err, buffer) => {
            if (err) {
                req.flash("error", "Что то пошло не так");
                res.redirect("/auth/reset");
            }
            const token = buffer.toString("hex");
            const candidate = await User.findOne({ email: req.body.email });
            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
                await candidate.save();
                res.redirect("/auth/login#login");
                await transporter.sendMail(resetEmail(candidate.email, token));
            } else {
                req.flash("error", "Email не найден");
                res.redirect("/auth/reset");
            }
        });
    } catch (e) {
        console.log(e);
    }
});

router.get("/password/:email/:token", async(req, res) => {
    if (!req.params.token) {
        return res.redirect("/auth/login#login");
    }
    try {
        const user = await User.findOne({
            email: req.params.email,
            resetToken: req.params.token,
            resetTokenExp: {
                $gt: Date.now(),
            },
        });
        if (!user) {
            return res.redirect("/auth/login#login");
        } else {
            res.render("auth/password", {
                title: "Ввостоновить досдуп",
                error: req.flash("error"),
                userId: user._id.toString(),
                token: req.params.token,
            });
        }
    } catch (e) {
        console.log(e);
    }
});

router.post("/password", async(req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: { $gt: Date.now() },
        });
        if (user) {
            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect("/auth/login#login");
        } else {
            req.flash("loginError", "Время токена истекло");
            res.redirect("/auth/login#login");
        }
    } catch (e) {
        console.log(e);
    }
});

module.exports = router;