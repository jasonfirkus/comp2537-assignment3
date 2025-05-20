"use strict";

import express from "express";

import Joi from "joi";
import bcrypt from "bcrypt";
import "dotenv/config";

import MongoStore from "connect-mongo";
import { MongoClient, ObjectId } from "mongodb";
import session from "express-session";

const app = express();
const PORT = 3000;
const HOUR_IN_SECONDS = 60 * 60;

if (process.env.NODE_ENV == "development") {
  const { createServer } = await import("livereload");
  const { default: connectLiveReload } = await import("connect-livereload");

  const liveReloadServer = createServer({ extraExts: ["ejs"] });
  liveReloadServer.watch("./public/");
  liveReloadServer.watch("./views/");
  app.use(connectLiveReload());
}

const client = new MongoClient(process.env.MONGODB_URI);
const db = (await client.connect()).db("users");
const USERS = db.collection("users");
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
const updateUserSchema = Joi.object({
  id: Joi.string().max(24).required(),
  role: Joi.string().max(5).required(),
});

/**
 * Middleware function to check if a user has a valid session and
 * Renders the home page if they are don't.
 *
 * @param {Object} req - The express request object.
 * @param {Object} res - The express response object.
 * @param {Function} next - The next middleware function.
 */
function isAuthenticated(req, res, next) {
  if (req.session?.userId) {
    return next();
  }
  return res.redirect("/");
}

/**
 * Middleware function to check if a user has the "admin" role and
 * allows them to continue if they do.
 *
 * @param {Object} req - The express request object.
 * @param {Object} res - The express response object.
 * @param {Function} next - The next middleware function.
 */
function isAdmin(req, res, next) {
  if (req.session?.role == "admin") {
    return next();
  }
  return res.status(403).render("error", {
    errorTitle: "Unauthorized",
    errorMessage: "ERR 403: You are not authorized to view this page",
    link: "/",
    buttonText: "Home",
    anon: false,
  });
}

app.get("/", (req, res) => {
  res.render("home", {
    anon: !req.session?.userId,
    name: req.session?.name,
  });
});

app.get("/admin", isAuthenticated, isAdmin, async (req, res) => {
  const users = await db
    .collection("users")
    .find(
      {},
      {
        projection: {
          name: 1,
          email: 1,
          role: 1,
          _id: 1,
        },
      }
    )
    .toArray();

  res.render("admin", { anon: false, users });
});

app.get("/signup", (req, res) => {
  res.render("signup", { anon: true });
});

app.get("/login", (req, res) => {
  res.render("login", { anon: true });
});

app.get("/game", (req, res) => {
  res.render("game", {
    anon: false,
    name: req.session?.name,
  });
});

app.get("/logout", isAuthenticated, (req, res) => {
  req.session.destroy();
  return res.redirect("/");
});

app.put("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const {
      error: validationError,
      value: { id, role },
    } = updateUserSchema.validate(
      { id: req.params.id, role: req.body.role },
      { stripUnknown: true }
    );

    if (validationError) {
      return res
        .status(400)
        .json({ message: "Failed to update user role", error: validationError });
    }

    const response = await USERS.updateOne(
      { _id: ObjectId.createFromHexString(id) },
      { $set: { role } }
    );

    console.log("Successfully updated role for user with id:", id);
    res.status(200).send("Successfully updated user role");
  } catch (error) {
    console.error(`Failed to update role for user with id: ${id}`, error);
    res.status(500).send("Failed to update user role");
  }
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
        errorTitle: "Signup Error",
        errorMessage: `"${validationError.details[0].context.key}" is required`,
        link: "/signup",
        buttonText: "Try Again",
        anon: true,
      });
    }

    const { insertedId } = await USERS.insertOne({
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
    res.redirect("/game");
  } catch (error) {
    console.error("Error inserting user", error);
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
        errorTitle: "Login Error",
        errorMessage: `"${validationError.details[0].context.key}" is required`,
        link: "/login",
        buttonText: "Try Again",
        anon: true,
      });
    }

    const user = await USERS.findOne({ email });
    if (!user) {
      return res.status(400).render("error", {
        errorTitle: "Login Error",
        errorMessage: "Invalid email",
        link: "/login",
        buttonText: "Try Again",
        anon: true,
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      req.session.userId = user._id; //start session
      req.session.name = user.name;
      req.session.role = user.role;
      req.session.save();

      return res.redirect("/game");
    } else {
      return res.status(400).render("error", {
        errorTitle: "Login Error",
        errorMessage: "Invalid email/password combination",
        link: "/login",
        buttonText: "Try Again",
        anon: true,
      });
    }
  } catch (error) {
    console.error("Error logging in user", error);
    res.status(500).json({ message: "Error logging in user", error });
  }
});

app.use((req, res, next) => {
  res.status(404).render("doesnotexist", { anon: !req.session?.userId });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
