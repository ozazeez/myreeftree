const mongoose = require("mongoose");

const BuildSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  cloudinaryId: {
    type: String,
    require: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  components: {
    tank: {
      type: Object,
    },
    lighting: {
      type: Object,
    },
    filter: {
      type: Object,
    },
    wavemake: {
      type: Object,
    },
    heater: {
      type: Object,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Build", buildSchema);
