import express from "express";
import { readFileSync } from "fs";

import Joi from "joi";
import bcrypt from "bcrypt";
import "dotenv/config";

import MongoStore from "connect-mongo";
import { MongoClient } from "mongodb";
import session from "express-session";

import { createServer } from "livereload";
import connectLiveReload from "connect-livereload";

const app = express();
const PORT = 3000;
const HOUR_IN_SECONDS = 60 * 60;

const client = new MongoClient(process.env.MONGODB_URI);
const db = (await client.connect()).db("users");
app.use(
  session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client,
      dbName: "sessions",
      collectionName: "sessions",
      ttl: HOUR_IN_SECONDS,
      crypto: { secret: process.env.MONGODB_SESSION_SECRET },
    }),
    cookie: { maxAge: 1000 * HOUR_IN_SECONDS },
  })
);

const liveReloadServer = createServer({ extraExts: ["ejs"] });
liveReloadServer.watch("./public/");
liveReloadServer.watch("./views/");
app.use(connectLiveReload());

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/styles", express.static("./public/styles"));
app.use("/scripts", express.static("./public/scripts"));
app.use("/assets", express.static("./public/assets"));

const signupSchema = Joi.object({
  name: Joi.string().alphanum().max(20).required(),
  email: Joi.string().email().max(30).required(),
  password: Joi.string().max(20).required(),
});
const loginSchema = Joi.object({
  email: Joi.string().email().max(30).required(),
  password: Joi.string().max(20).required(),
});

app.get("/authenticated", async (req, res) => {
  console.log("id", req.session?.userId);

  if (req.session?.userId) {
    return res.status(200).json({
      userId: req.session.userId,
      name: req.session?.name,
    });
  }

  res.status(401).json({ authenticated: false });
});

app.get("/", (req, res) => {
  res.render("home", { anon: !req.session?.userId, name: req.session?.name });
});

app.get("/admin", (req, res) => {
  if (!req.session?.userId) {
    return res.redirect("/login");
  } else if (req.session?.role != "admin") {
    return res.status(403).render("error", {
      type: "Unauthorized",
      errorTitle: "Unauthorized",
      errorMessage: "You are not authorized to view this page",
    });
  }

  res.render("admin", { users });
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/members", (req, res) => {
  if (!req.session?.userId) {
    return res.redirect("/");
  }
  res.render("members", { name: req.session?.name });
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

app.post("/signup", async (req, res) => {
  try {
    const {
      error: validationError,
      value: { name, email, password },
    } = signupSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (validationError) {
      return res.status(400).render("error", {
        type: "signup",
        errorTitle: "Error signing up",
        errorMessage: `${validationError.details[0].context.key} is required`,
      });
    }

    const { insertedId } = await db.collection("users").insertOne({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: "user",
    });

    req.session.userId = insertedId; //start session
    req.session.name = name;
    req.session.role = "user";
    req.session.save();
    console.log("Inserted user with id: ", insertedId);
    res.redirect("/members");
  } catch (error) {
    console.log("Error inserting user", error);
    res.status(500).json({ message: "Error inserting user", error });
  }
});

app.post("/login", async (req, res) => {
  try {
    const {
      error: validationError,
      value: { email, password },
    } = loginSchema.validate(req.body, {
      stripUnknown: true,
    });

    if (validationError) {
      return res.status(400).render("error", {
        type: "login",
        errorTitle: "Error logging in",
        errorMessage: `${validationError.details[0].context.key} is required`,
      });
    }

    const user = await db.collection("users").findOne({ email });
    if (!user) {
      return res.status(400).render("error", {
        type: "login",
        errorTitle: "Error logging in",
        errorMessage: "Invalid email",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id; //start session
      req.session.name = user.name;
      req.session.role = user.role;
      req.session.save();

      return res.redirect("/members");
    } else {
      return res.status(400).render("error", {
        type: "login",
        errorTitle: "Error logging in",
        errorMessage: "Invalid email/password combination",
      });
    }
  } catch (error) {
    console.log("Error logging in user", error);
    res.status(500).json({ message: "Error logging in user", error });
  }
});

app.use((req, res, next) => {
  res.status(404).render("doesnotexist");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
