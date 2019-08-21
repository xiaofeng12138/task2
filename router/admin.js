const express = require('express');
const {user,task} = require("../model/schema");
const router = express.Router();
const crypto = require('crypto');

//设置权限
router.use((req, res,next)=>{
   if(req.session.login){
    if(req.session.user.level >= 10){
      return next();
    }
    return res.send('您没有权限访问该页面')
   }else{
    res.send('请登录！！')
   }
})

router.get('/user',(req,res)=>{
   res.render('../view/admin/user.ejs',{
      user:req.session.user,
      title:'用户管理'
   })
}).post('/user',(req,res)=>{
   Promise.all([
       user.find().skip((req.body.page - 1)* req.body.limit).limit(Number(req.body.limit)),
       user.countDocuments()
   ]).then((data)=>{
     res.send({
         code:0,
         data:data[0],
         count:data[1]
     })
   })
})

//修改用户账号是否可用
router.post('/user/reuserlevel',(req,res)=>{
 
   user.findOne({_id: req.body.user_id},(err,data)=>{
     if(data.level >= 999){
      return res.send({code:1,data:'超级管理员无法修改'})
     }
   //   if(req.body.user_id !== req.session.user.id && req.body.user_id >req.session.user.id){
   //      return res.send({code:1,data:'修改失败'})
   //   }
   user.updateOne({_id: req.body.user_id},{$set:{used:req.body.used}},()=>{
         res.send({code:0,data:'修改成功'})
      })
   })
   
})

//删除用户功能
router.post('/user/deluser',(req,res)=>{
 
   // if(!req.body._id){
   //    return res.send({code:1,data:'您无权限操作'})
   // }
   user.findOne({_id:req.body._id},(err,data)=>{
      if(data.level >= 999){
       return res.send({code:1,data:'超级管理员无法删除'})
      }
      if(data._id === req.session.user._id){
        return res.send({code:1,data:'不能删除自己'})
      }
      if(data.level >= 10 && req.session.user.level < 999){
         return res.send({code:1,data:'请联系超级管理员删除'})
      }
   Promise.all([
     user.deleteOne({_id: req.body._id}), // 删除用户数据
     task.deleteMany({author: req.body._id}), // 删除用户发布的文章/任务
     task.updateMany({"receiver.user": req.body._id}, {$pull: {"receiver":{user:req.body._id}}}) // 删除用户接取的任务/评论
     ]).then(()=>{
     res.send({code:0,data:'用户删除成功'})
     })
   }) 
})

//修改用户级别
router.post('/user/relevel',(req,res)=>{
   user.updateOne({_id:req.body._id},{$set:{level:req.body.level}},()=>{
      res.send({code:0,data:'用户级别修改成功'})
   })
})

router.get('/task/add',(req,res)=>{
   res.render('../view/admin/addtask.ejs',{
      user:req.session.user,
      title:'任务发布'
   })
})

router.post('/task/add',(req,res)=>{
   const data = req.body;
   console.log(data)
   data.author = req.session.user._id;
   data.time = new Date();

  task.create(data,(err,data)=>{
   if (err) {
      return res.send({code:1,data:"数据库保存错误"})
   }
   //更新用户发表文章后用户表里面的数据
   user.updateOne({_id: req.session.user._id}, {$push: {'task.publish': data._id}}, function () {
      res.send({code: 0, data: '任务发布成功'})
    });
  })
})

//任务管理功能
router.get('/task/manage',(req,res)=>{
  res.render('../view/admin/managetask.ejs',{
     title:'任务管理',
     user:req.session.user
  })
});
router.post('/task/manage',(req,res)=>{
   Promise.all([
      //连表查询
      task.find().populate('author').skip((req.body.page - 1) * req.body.limit).limit(Number(req.body.limit)),
      task.countDocuments()
   ]).then((data)=>{
     res.send({code:0,data:data[0],count:data[1]})
   })
})


//删除任务功能
router.post('/task/del',(req,res)=>{
  Promise.all([
    task.deleteOne({_id: req.body._id}),
    user.updateMany(
      {$or: [{'task.publish': req.body._id}, {'task.receive': req.body._id}, {'task.accomplish': req.body._id}]},
      {$pull: {'task.publish': req.body._id, 'task.receive': req.body._id, 'task.accomplish': req.body._id}}
      )
  ]).then(()=>{
      res.send({code:0,data:'任务删除成功'})
  });
 
})


module.exports = router;