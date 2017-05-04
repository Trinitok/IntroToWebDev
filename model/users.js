var mongoose = require('mongoose');
var userSchema  = new mongoose.Schema({
    ref: Number,
    username: String,
    password: String,
    position: String,
    alumnusStatus: Boolean,
    profPoints: Number,
    serveHours: Number,
    littles: [Number],
    initiationClass: {type: Number, enum: [0,1,2,3,4,5,6]},
    gradYear: {type: Number, enum: [2016, 2017, 2018, 2019, 2020, 2021]}
});


mongoose.model('User', userSchema);