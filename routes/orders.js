const { Router } = require("express");
const Order = require("../models/order");
const authMiddleware = require("../middleware/auth");
const router = Router();

router.get("/", authMiddleware, async(req, res) => {
    try {
        const orders = await Order.find({ "user.userId": req.user._id })
            .populate("user.userId")
            .lean();
        res.render("orders", {
            isOrder: true,
            title: "Заказы ",
            orders: orders.map((o) => {
                return {
                    ...o,
                    price: o.courses.reduce((total, c) => {
                        return (total += c.count * c.course.price);
                    }, 0),
                };
            }),
        });
    } catch (e) {
        console.log(e);
    }
});

router.post("/", authMiddleware, async(req, res) => {
    try {
        const user = await req.user.populate("cart.items.courseId");
        const courses = user.cart.items.map((i) => ({
            count: i.count,
            course: {...i.courseId._doc },
        }));
        const order = new Order({
            user: {
                name: req.user.name,
                userId: req.user,
            },
            courses,
        });
        await order.save();
        await req.user.clearCart();
        res.redirect("/orders");
    } catch (err) {
        console.log(e);
    }
});

module.exports = router;