const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
exports.registerValidators = [
    body("email")
    .isEmail()
    .withMessage("Введите корректны email")
    .custom(async(value, req) => {
        try {
            const user = await User.findOne({ email: value });
            if (user) {
                return Promise.reject("Email занить");
            }
        } catch (err) {
            console.log(err);
        }
    })
    .normalizeEmail(),
    body("password", "Парол долшен быт минимум 6 сим")
    .isLength({ min: 6 })
    .trim(),
    body("confirm")
    .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Паролы должен совподат");
        } else {
            return true;
        }
    })
    .trim(),
    body("name")
    .isLength({ min: 3 })
    .withMessage("Имя должен быт минимум 3 символд")
    .trim(),
];

exports.loginValidators = [
    body("email")
    .isEmail()
    .withMessage("Введите корректны email")
    .normalizeEmail()
    .trim()
    .custom(async(value, { req }) => {
        try {
            const user = await User.findOne({ email: value });
            if (!user) {
                return Promise.reject("Ползовател не найден");
            }
        } catch (err) {
            console.log(err);
        }
    }),
    body("password", "Парол долшен быт минимум 6 сим")
    .isLength({ min: 6 })
    .trim()
    .custom(async(value, { req }) => {
        try {
            const user = await User.findOne({ email: req.email });
            if (user) {
                const result = await bcrypt.compare(req.body.password, user.password);
                if (!result) {
                    return Promise.reject("Неверный парол");
                }
            }
        } catch (err) {
            console.log(err);
        }
    }),
];

exports.courseValidators = [
    body("title")
    .isLength({ min: 3 })
    .withMessage("Title mинималный 3 сим")
    .trim(),
    body("price").isNumeric().withMessage("Введите корректны цена"),
    body("img").isURL().withMessage("Введите корректны Url картинки"),
];