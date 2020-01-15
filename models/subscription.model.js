const { Schema, model } = require('mongoose')
const SubscribeSchema = new Schema(
  {
    course: { 
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true
    },
    module: { type: Number, default: 1 },
    user: { 
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    period: [{
      day: { type: Schema.Types.Number, required: true }, 
      time: { type: Schema.Types.Number, required: true }
    }],
    completed: { type: Schema.Types.Boolean, default: false },
    __v: { type: Number, select: false }
  },
  { timestamps: true }, { toObject: { virtuals: true }, toJSON: { virtuals: true } }
)

const Subscribe = model('Subscribe', SubscribeSchema)

module.exports = Subscribe
