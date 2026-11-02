import mongoose from 'mongoose';
const productSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,maxlength:120},
 category:{type:String,required:true,trim:true},
 price:{type:Number,required:true,min:0},
 description:{type:String,default:'',maxlength:2000},
 image:{type:String,default:''},
 inStock:{type:Boolean,default:true}
},{timestamps:true});
export default mongoose.model('Product',productSchema);
