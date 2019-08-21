const express = require('express');
const {user,task} = require("../model/schema");
const router = express.Router();
const crypto = require('crypto');

router.get('/',(req,res)=>{
  res.render('index',{
     login:req.session.login,
     user:req.session.user,
     title:'赏金系统'
  })
})
router.get('/reg',(req,res)=>{res.render('reg',{
   title:'用户注册'
})}).post('/reg',(req,res)=>{
    user.findOne({username:req.body.username}).then((data)=>{
        //console.log(data)
      if(data){
         return res.send({code:2,msg:'用户名已存在'})
      }else{
         //1、选择加密方式 
         const c = crypto.createHash('sha256');
         //2、加密
         const password = c.update(req.body.password).digest('hex');
         user.create({
             username:req.body.username,
             password:password
         }).then((data)=>{
            return res.send({code:0,msg:'注册成功'})
         }).catch((err)=>{
           console.log(err);
         })
      }
    })
})


router.get('/login',(req,res)=>{
  res.render('login',{
     login:req.session.login,
      title:'用户登录'
  })
}).post('/login',(req,res)=>{
  user.findOne({username:req.body.username}).then((data)=>{
     if(data){
         const c = crypto.createHash('sha256');
         const password = c.update(req.body.password).digest('hex');
         if(data.password === password){
            req.session.login = true;
            req.session.user = data;
           return res.send({code:0,msg:'登陆成功'})
         }else{
           return res.send({msg:'用户名或密码错误'})
         }
     }else{
      res.send({msg:'用户名不存在，请先注册！！'})
     }
  })
})

router.get('/logout',  (req, res)=>{
  req.session.destroy();
  res.redirect('/');
});

//查看任务详情部分
router.get('/task/:id',(req, res)=>{
   //console.log(req.params.id);
   //关联查询
   task.findOne({_id: req.params.id}).populate('author receiver.user').exec(function (err, data) {
     //console.log(data.receiver)
     if(req.session.user){
      const a = data.receiver.findIndex(function (val) {
            // 如果等于 代表当前登录的用户 在已经接取的数组里
            // -1 没有接取  其他所有 已经接取了
            //  console.log( typeof val._id)
            //  console.log( typeof req.session.user._id)
           return String(val._id) === req.session.user._id
          });
          res.render('detail',{
            title:'详情页-'+ data.title,
            user:req.session.user,
            login:req.session.login,
            data:data,
            a
          })
        }else{
           res.render('detail',{
            title:'详情页-'+ data.title,
            user:req.session.user,
            login:req.session.login,
            data:data,
            a:-1
          })
        }
     })
})

//接取任务功能

router.post('/task/:id',(req, res)=>{
 // console.log(req.params.id)
  if(!(req.session.login)){
    return res.send({code:1,msg:'请先登录，再接取任务'})
  }
   Promise.all([
    task.updateOne({_id: req.params.id}, {$push: {receiver:{user: req.session.user._id}}}).then(()=>{
      return res.send({code:0,msg:'任务接取成功'})
    }),
    user.updateOne({_id: req.session.user._id}, {$push: {'task.receive': req.params.id}})
    ]).then(function () {
    });
})

router.post('/taskk/finishmsg',function (req,res) {
   const data = req.body;
   data.fintime = new Date();
     task.updateOne({_id:req.body.taskid},
     {$set: {
      ['receiver.' + req.body.index + '.msg']: req.body.msg,
      ['receiver.' + req.body.index + '.fintime']: req.body.fintime
    },
      ['receiver.' + req.body.index + '.finmsg']: true
    }).then(()=>{
      res.send({code:0,msg:'完成说明成功'})
    })
})

module.exports = router;