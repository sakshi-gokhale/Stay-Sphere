//This Schema is for Server side validation 
//this is for edit listing(update route) and new listing (create route) 
//suppose if the form is accepted with empty field (eg, title, location, etc), joi will not allow such, 



/*
app.post("/listings", 
    wrapAsync( async(req, res, next) => {
    if(!req.body.listing){
        throw new ExpressError(404, "Send valid data for listing");
    }
    const newListing=new Listing(req.body.listing);
    if(!newListing.title){
        throw new ExpressError(404, "Title is missing");
    }
    if(!newListing.description){
        throw new ExpressError(404, "Description is missing");
    }


    await newListing.save();
    res.redirect("/listings");    

}));
*/
//also with the help of joi, we can avoide writing multiple if statements 


const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),    
    }).required(),
});