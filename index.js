const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const path = require("path");
const exphbs = require("express-handlebars");
const homeRoutes = require("./routes/home");
const coursesRoutes = require("./routes/courses");
const addRoutes = require("./routes/add");
const cardRoutes = require("./routes/card");
const ordersRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const mongoose = require("mongoose");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const errorMiddleware = require("./middleware/error");
const fileMiddleware = require("./middleware/file");
const csrf = require("csurf");
const flash = require("connect-flash");
const keys = require("./keys/");
const helmet = require("helmet");
const compression = require("compression");
require("dotenv").config();

const app = express();

const MONGODB_URL = keys.MONGODB_URL;
const PORT = keys.PORT;

const hbs = exphbs.create({
    defaultLayout: "main",
    extname: "hbs",
    helpers: require("./utils/hbs-helpers"),
});

const store = new MongoStore({
    collection: "sessions",
    uri: MONGODB_URL,
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: false }));
app.use(
    session({
        secret: keys.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
    })
);
app.use(fileMiddleware.single("avatar"));
app.use(csrf());
app.use(flash());
// app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/courses", coursesRoutes);
app.use("/add", addRoutes);
app.use("/card", cardRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use(errorMiddleware);

async function start() {
    try {
        await mongoose.connect(MONGODB_URL, {
            useNewUrlParser: true,
        });
        app.listen(PORT, () => {
            console.log(`Server starting on port ${PORT}`);
        });
    } catch (e) {
        console.log(e);
    }
}

start();