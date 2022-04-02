const { Schema, model } = require("mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        require: true,
    },
    name: {
        type: String,
        require: true,
    },
    avatarUrl: String,
    password: {
        type: String,
        require: true,
    },
    cart: {
        items: [{
            count: {
                type: Number,
                required: true,
                default: 1,
            },
            courseId: {
                type: Schema.Types.ObjectId,
                ref: "Course",
            },
        }, ],
    },
    resetToken: String,
    resetTokenExp: Date,
});

userSchema.methods.addToCart = function(course) {
    const items = [...this.cart.items];
    const idx = items.findIndex((c) => {
        return c.courseId.toString() === course._id.toString();
    });
    console.log(idx);
    if (idx >= 0) {
        items[idx].count = items[idx].count + 1;
    } else {
        items.push({
            courseId: course._id,
            count: 1,
        });
    }
    this.cart = { items };
    return this.save();
};

userSchema.methods.removeFromCart = function(id) {
    let items = [...this.cart.items];
    const idx = items.findIndex((c) => c.courseId.toString() === id.toString());
    if (items[idx].count === 1) {
        items = items.filter((c) => c.courseId.toString() !== id.toString());
    } else {
        items[idx].count--;
    }
    this.save();
    this.cart = { items };
};

userSchema.methods.clearCart = function() {
    this.cart = { items: [] };
    return this.save();
};
module.exports = model("User", userSchema);