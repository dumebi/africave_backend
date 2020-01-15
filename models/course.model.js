const { Schema, model } = require('mongoose')
const CourseSchema = new Schema(
  {
    title: { type: Schema.Types.String, required: true },
    description: { type: Schema.Types.String },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Course = model('Course', CourseSchema)

module.exports = Course
