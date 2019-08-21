const express = require('express');
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');

// 连接数据库
mongoose.connect('mongodb://localhost/xiaofeng12345', { useNewUrlParser: true });


//设置session
app.use(session({
  secret: 'xiaofeng', // 密钥
  rolling: true, // 每次操作(刷新页面  点击a标签  ajax) 重新设定时间
  resave: false, // 是否每次请求都重新保存数据
  saveUninitialized: false, // 初始值
  cookie: {maxAge: 1000 * 60 * 60},
  
}));



//获取post参数
app.use(express.json());
app.use(express.urlencoded({extends:false}))


//设置静态资源目录
app.use(express.static(__dirname+ '/public'))

//设置模板引擎

app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');

app.use('/',require('./router/router'))
app.use('/api',require('./router/upload'))
app.use('/admin',require('./router/admin'))


app.listen('6022',()=>{
    console.log('项目已启动成功，监听在6022端口');
})