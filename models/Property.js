const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: true,
            trim: true
        },
        description:{
            type: String
        },
        price:{
            type: Number,
            required: true
        },
        purpose:{
            type: String,
            enum: ["rent", "sell", "buy"],
            required: true
        },
        propertyType:{
            type: String,
            required: true
        },
        images:{
            type: [String],
            default: []
        },
        location:{
            type:{
                type: String,
                enum: ["Point"],
                required: true
            },
            coordinates:{
                type: [Number], //here we'll store the lng and lat
                required: true
            }
        },
        city: { type: String },
    },
    {timestamps: true}
);

propertySchema.index({location: "2dsphere"});
module.exports = mongoose.model("Property", propertySchema);