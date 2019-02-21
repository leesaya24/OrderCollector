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
                res.writeHead(302, {'Location': '/upload'}); // 302는 강제 리다이렉트 코드. 업로드 관리페이지 갱신용.
                res.end();
            })
        });
    });

   
    app.get('/download', function(req,res){ // 다운로드 api : 머지된 json 파일을 엑셀파일로 변형해서 클라이언트로 내려보낸다.
        let filePath = 'data_download/'+req.query.filename;
        fs.stat(filePath, function (err, stats) {
            if (err)
                res.render('downError.html');
            else 
                res.download(filePath);
        });
    });
};

function excel2json(excelFile)
{
    var resData;

    var workbook = xlsx.readFile(excelFile.path);
    var sheetnames = Object.keys(workbook.Sheets);

    let i = sheetnames.length;

    while (i--) {
        var sheetname = sheetnames[i];
        resData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
    }
    return resData;
};

function writeFile(jsonData)
{
    // 파일이 없으면 그대로 저장
    // 파일이 있으면 머지해서 저장
    var jsonobj;
    if (checkFileExist('output.json')) // 기존에 머지된 파일이 있다.
    {
        jsonobj = JSON.parse(fs.readFileSync('output.json', 'utf8')); // 머지용 파일 오픈
        for (var i in jsonData)
            jsonobj.push(jsonData[i]); // 전송된 데이터 추가
    }
    else
    {
        jsonobj = jsonData; // 머지파일 없으면 현재값을 그대로 저장.
    }

    var jsonContent = JSON.stringify(jsonobj); // 스트링으로 변환
 
    fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
    });
}

function checkFileExist(filePath)
{
    try {
        if (fs.existsSync(filePath)) {
            return true;
        }
    } catch (err) {
        return false;
    }
}


