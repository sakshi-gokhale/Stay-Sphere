const express=require("express");
const app=express();
const mongoose= require("mongoose");
const Listing=require("./models/listings.js");
const path= require("path");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const{listingSchema}=require("./schema.js");

const MONGO_URL="mongodb://127.0.0.1:27017/staySphere";

main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")))



app.get("/", (req, res)=>{
    res.send("Hi, I am root");
});


const validateListing = (req, res, next)=>{
    let {error}=listingSchema.validate(req.body);
    if(error){
        let errMsg=error.details.map((el)=> el.message.join(","));
        throw new ExpressError(404, errMsg);
    }else{
        next();
    }
};


//index route
app.get("/listings", wrapAsync(async(req, res)=>{
    const allListings=await Listing.find({});
    res.render("listings/index", {allListings});
}));



//new route
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//show route
app.get("/listings/:id", wrapAsync(async(req, res)=>{
    const {id}=req.params;
    const listing= await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));


//create route
app.post("/listings",
    validateListing, 
    wrapAsync( async(req, res, next) => {
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");    

}));


//edit route
app.get("/listings/:id/edit", wrapAsync(async(req, res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});

}));

//update route
app.put("/listings/:id", 
    validateListing,
    wrapAsync(async(req, res)=>{
    const {id}=req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect("/listings/${id}");


}));

//delete route
app.delete("/listings/:id", wrapAsync(async(req, res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");

}));


//for all non existing routes
app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found"));
})


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





