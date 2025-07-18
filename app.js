if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express=require("express");
const app=express();
const mongoose= require("mongoose");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js")
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const { console } = require('inspector');


const dbURL = process.env.ATLASDB_URL;

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
console.log(err);
});

async function main() {
    await mongoose.connect(dbURL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret : process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=>{
    console.log("ERROR in MONGO SESSION STORE", err);
})

const sessionOptions = {
    store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie: {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};


app.use(session (sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next)=>{
//     res.locals.success = req.flash("success");
//     res.locals.error = req.flash("error");
//     res.locals.currUser = req.user;
//     next();

// });


app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


// app.get("/demouser", async(req, res) =>{
//     let fakeUser =new User({
//         email: "sakshigokhale",
//         username: "sakshi-gokhale",
//     });

//     let newUser =await User.register(fakeUser, "helloWorld");
//     res.send(newUser);
// });


app.get("/", (req, res)=>{
    res.render("listings/home.ejs");
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//for all non existing routes
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found"));
});

//error handling middleware
app.use((err, req, res, next)=>{
    let{statusCode=500, message="Something went wrong"}=err;
    res.status(statusCode).render("error.ejs", {message})
});

app.listen(8080, ()=>{
    console.log("listing at the port 8080");
});


// app.get("/testListing", async (req, res)=>{
//     let sampleListing=new Listing({
//         title: "My new villa",
//         description:"By the beach",
//         price: 2500,
//         location:"Calangute, Goa",
//         Country:" India",
//     });

//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Succesful Listing");
// })





