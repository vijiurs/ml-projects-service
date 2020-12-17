var mongoose = require('mongoose');
const moment = require('moment-timezone');
const dateFormat = moment.tz(Date.now(), "Asia/kolkata");


var Schema = mongoose.Schema,ObjectId = Schema.ObjectId;
var projectModel = mongoose.model('userProjectsTemp',new mongoose.Schema({
	"id": String,
	"userId": String,
    "requestBody":Object,
    "headers":Object,
    "createdAt": { type:Date, default:dateFormat },
    "projectDetails":Object
    
},{collection: 'userProjectsTemp'} ) );
module.exports = projectModel;
