const express=require("express");
const router = express.Router();
const wrapAsync=require("../utils/wrapAsync.js");
const Listing=require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const { populate } = require("../models/review.js");
const path = require("path");
const listingController = require("../controllers/listings.js")

router.route("/")
.get(wrapAsync(listingController.index))       //index route
.post(isLoggedIn,                               //create route
    validateListing, 
    wrapAsync(listingController.createListing));
                           
//new route
router.get("/new",isLoggedIn, listingController.renderNerForm);


router.route("/:id")
.get(wrapAsync(listingController.showListing))   //show route
.put(isLoggedIn,                                  //update route
    isOwner,
    validateListing,
    wrapAsync(listingController.updateListing)) 
.delete(isLoggedIn,                               //delete route
        isOwner,
        wrapAsync(listingController.destroyListing));           
   

//create route
router.post("/",
    isLoggedIn,
    validateListing, 
    wrapAsync(listingController.createListing));


//edit route
router.get("/:id/edit", 
    isLoggedIn, 
    isOwner,
    wrapAsync(listingController.renderEditForm));


module.exports=router;