const fs = require('fs');
const multiparty = require('multiparty');
const xlsx = require('xlsx');  
const json2xls = require('json2xls');
const multer = require('multer');
const utils = require('./utils');
const url = require('url'); 
const querystring = require('querystring');

var _storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'data_upload/')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    }
  })

const upload = multer({ storage: _storage });

module.exports = function(app)
{

    app.get('/', function(req, res){  // 시작페이지.
        res.render('home.html');
    });

    app.get('/upload', function(req, res){ // 업로드 관리페이지.
        utils.getUploadFileList(function (result) {
            res.end(utils.makeMainHtml(result));
        });
    });

    app.post('/upload',  upload.single('userfile'), function(req, res){ // 파일 업로드.
        utils.makeTotalOrderFile(function(){
            res.writeHead(302, {'Location': '/upload'}); // 302는 강제 리다이렉트 코드. 업로드 관리페이지 갱신용.
            res.end();
        })

    });

    app.post('/delete', function(req, res) { // 주문서 파일 삭제

        var filePath = 'data_upload/'+req.body.filename;

        fs.unlink(filePath, function (err) {
            utils.makeTotalOrderFile(function(){ // 파일을 지운상태를 반영해서 최종수문서 파일을 다시 수정한다.
                res.writeHead(302, {'Location': '/upload'}); 
                res.end();
            })
        });
    });

   
    app.get('/download', function(req,res){ // totalorder 파일 다운로드.
        let filePath = 'data_download/'+req.query.filename;
        fs.stat(filePath, function (err, stats) {
            if (err)
                res.render('downError.html');
            else 
                res.download(filePath);
        });
    });
};



