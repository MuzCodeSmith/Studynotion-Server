const RatingAndReview = require('../models/RatingAndReview');
const Course = require('../models/Course');
const User = require('../models/User');

exports.createRating = async (req, res) => {
    try {
        const userId = req.user.id;

        const { rating, review, courseId } = req.body;
        // check is user Enrolled or not
        const courseDetails = await Course.findOne({
            _id: courseId,
            studentsEnrolled: { $elemMatch: { $eq: userId } }
        });
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `student is not enrolled in this course`
            })
        }
        // check if user already rated the course
        const alreadyReviewed = await RatingAndReview.findOne({ user: userId, course: courseId });
        if (alreadyReviewed) {
            return res.status(404).json({
                success: false,
                message: "course is already reviewed by user"
            })
        }

        // create rating
        const ratingReview = await RatingAndReview.create({
            rating,
            review,
            user: userId,
            course: courseId
        })
        // updating in the course collection
        const updatedCourse = await Course.findByIdAndUpdate({ _id: courseId },
            {
                $push: { ratingAndReviews: ratingReview._id }
            },
            { new: true });
        console.log(updatedCourse)
        return res.status(200).json({
            success: true,
            message: `review and rating added successfully`
            ratingReview,
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'error while rating: ' + error.message
        })
    }
}