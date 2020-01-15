const { Schema, model } = require('mongoose')
const ModuleSchema = new Schema(
  {
    course: { 
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    name: { type: Schema.Types.String, required: true },
    link: { type: Schema.Types.String, required: true },
    number: { type: Schema.Types.Number, required: true },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Module = model('Module', ModuleSchema)

module.exports = Module
