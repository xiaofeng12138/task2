const mongoose = require('mongoose');

//用户的schema
const userSchema = new mongoose.Schema({
    username:{type:String,require:true},
    password:{type:String,require:true},
    used:{type:Boolean,require:true,default:false},//设置用户账号是否可用，默认不可用
    //设置用户权限
    level:{type:Number,default:11 },
    //任务状态
    task:{
     //发布的任务
     publish:{type:[{type:mongoose.Schema.Types.ObjectId,ref:'task'}]},
     //接受的任务
     receive:{type:[{type:mongoose.Schema.Types.ObjectId,ref:'task'}]},
     //完成的任务
     accomplish:{type:[{type:mongoose.Schema.Types.ObjectId,ref:'task'}]},
    },
    versionKey:false
})

//任务详情的Schema
const taskSchema = new mongoose.Schema({
    title:{type:String}, //标题
    content:{type:String},//内容
    author:{type:mongoose.Schema.Types.ObjectId,ref:'user'}, //作者
    receiver:{type:[{
        user: {type:mongoose.Schema.Types.ObjectId,ref:'user'},
        msg:{type:String },
        finmsg:{type:Boolean,default:false}, //任务是否完成
        fintime:{type:Number}
       }
    ]}, //接收人
    time:{type:Number},//发布时间
    num:{type:Number}, //人数限制
    reward: {type: String}, // 奖励
    difficulty: {type: String}, // 难度
    expiration: {type: String}, // 截止日期
    can:{type:Boolean,default:false} //任务是否完成
})


// 创建表
const user = mongoose.model('user', userSchema);
const task = mongoose.model('task', taskSchema);

module.exports = {
    user,
    task
}