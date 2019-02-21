const express = require('express');
const app = express();
const bodyParser = require('body-parser'); 

app.set('views', __dirname + '/views'); 
app.set('view engine', 'ejs'); 
app.engine('html', require('ejs').renderFile); 
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());

const router = require('./modules/main')(app);



var server = app.listen(3000, function(){ 
    console.log("Start server on localhost:3000");
});



// app.post('/post_reciver', function(req, res){

//     res.send(req.body.id);
// })