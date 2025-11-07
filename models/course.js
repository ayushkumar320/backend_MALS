import mongoose from "mongoose";
import teacher from "./teacher.js";

const courseSchema = new mongoose.Schema({
   courseName: { 
        type: String, 
        required: true 
    },
    courseCode: { 
        type: String, 
        required: true 
    },
    description: { 
        type: String, 
        required: true,
        maxlength: 500
    },
    credits: { 
        type: Number, 
        required: true 
    },
    instructor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "teacher",
        required: true 
    },
});

const Course = mongoose.model("Course", courseSchema);
export default Course;
