const express = require('express');
const router = express.Router();
const { user,task} = require('../model/schema');
const multer = require('multer');
const path = require('path');


// console.log(__dirname)
// console.log(process.cwd())
let storage = multer.diskStorage({
    //存储的位置
    //destination: path.join(process.cwd(),'public/upload'),
    //重命名文件函数
    destination: path.join(__dirname,'../public/upload'),
    filename(req,file,cb){
      const filename = file.originalname.split('.');
      cb(null,`${Date.now()}.${filename[filename.length -1]}`)
    }
})

const upload = multer({
    storage:storage
})


router.post('/upload',(req,res)=>{
  upload.single('file')(req,res,(err)=>{
   if(err){
     return res.send({code:1})
    }
    res.send({code: 0, data: {
    src: `/upload/${req.file.filename}`
      }})  
  })
})
//此部分本来卸载后台的,查询所有的任务
router.post('/task/manage',(req,res)=>{
   Promise.all([
      //连表查询
      task.find().populate('author').sort({"_id":-1})
      .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
      //查询所有条数
      task.countDocuments()
   ]).then((data)=>{
     res.send({code:0,data:data[0],count:data[1]})
   })
})

//查询可以接取的任务的任务
router.post('/task/can',(req,res)=>{
   Promise.all([
      // false 代表可以接取
      task.find({"can":false}).populate('author').sort({"_id":-1})
      .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
      //查询所有条数
      task.countDocuments({can: false})
   ]).then((data)=>{
     res.send({code:0,data:data[0],count:data[1]})
   })
})

//查询不可接取的任务的任务
router.post('/task/notcan',(req,res)=>{
   Promise.all([
      // false 代表可以接取
      task.find({"can":true}).populate('author').sort({"_id":-1})
      .skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
      //查询所有条数
      task.countDocuments({can: true})
   ]).then((data)=>{
     res.send({code:0,data:data[0],count:data[1]})
   })
})

//查询我的发布的任务
router.post('/task/my', function (req, res) {
  user.findOne({_id: req.session.user._id})
    .populate({
      path: 'task.publish',
      options: {
        sort: {_id: -1},
        skip: (req.body.page - 1) * req.body.limit,
        limit: Number(req.body.limit)
      }
    }).then(function (data) {
    res.send({code: 0, data: data.task.publish, count: data.task.publish.length})
  })
});

//查询我已经接取的任务
router.post('/task/receive', function (req, res) {
  user.findOne({_id: req.session.user._id})
    .populate({
      path: 'task.receive',
      options: {
        sort: {_id: -1},
        skip: (req.body.page - 1) * req.body.limit,
        limit: Number(req.body.limit)
      }
    }).then(function (data) {
    res.send({code: 0, data: data.task.receive, count: data.task.receive.length})
  })
});

//查询我已经完成的任务
router.post('/task/finish', function (req, res) {
  user.findOne({_id: req.session.user._id})
    .populate({
      path: 'task.accomplish',
      options: {
        sort: {_id: -1},
        skip: (req.body.page - 1) * req.body.limit,
        limit: Number(req.body.limit)
      }
    }).then(function (data) {
    res.send({code: 0, data: data.task.accomplish, count: data.task.accomplish.length})
  })
});

module.exports = router;