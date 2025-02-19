const mongoose = require('mongoose')
const Tour = require('./tourModel')

const reviewsSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

reviewsSchema.index({tour: 1, user: 1}, {unique: true})

reviewsSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     options: { select: 'name' } // <-- wrap `select` in `options` here...
    // }).populate({
    //     path: 'user',
    //     options: { select: 'name photo' } // <-- and here
    // });
    this.populate({
        path: 'user',
        options: { select: 'name photo' } // <-- and here
    });
    next();
});

reviewsSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        }, 
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ])
    console.log(stats)

    if(stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        }) 
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        })
    }

}

reviewsSchema.post('save', function () {
    // this points to current review

    this.contructor.calcAverageRatings(this.tour)
})

reviewsSchema.pre(/^findOneAnd/, async function(next) {
    const r = await this.findOne
    next()
})

reviewsSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT worl here, query has already executed
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review = mongoose.model('Review', reviewsSchema)

module.exports = Review;
