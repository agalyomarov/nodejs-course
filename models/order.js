const { Schema, model } = require('mongoose');
const orderSchema = new Schema({
    courses: [{
        course: {
            type: Object,
            require: true
        },
        count: {
            type: Number,
            require: true
        }
    }],
    user: {
        name: String,
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            require: true,
        }
    },
    date: {
        type: Date,
        default: Date.now()
    }
});


module.exports = model('Order', orderSchema);