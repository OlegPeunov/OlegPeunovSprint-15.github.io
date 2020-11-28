const mongoose = require('mongoose');
const validator = require('validator');

const cardsSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: (v) => validator.isURL(v),
      message: 'URL validation failed',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  likes: [{}],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('cards', cardsSchema);
