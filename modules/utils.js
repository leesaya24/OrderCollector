var fs = require('fs');
const xlsx = require('xlsx');  
const json2xls = require('json2xls');

module.exports.getUploadFileList = function (callback) {  // 업로드된 파일 리스트를 구하는 모듈

    var fileInfos = new Array();

    fs.readdir('data_upload', function (error, filelist) {  
        if (isEmpty(filelist))
            callback(fileInfos);
        else {
            for (var i = 0; i < filelist.length; i++) {  
                var fileName = filelist[i];

                makeFileInfo(fileName, function (result) {
                    fileInfos.push(result);

                    if (fileInfos.length == filelist.length)
                        callback(fileInfos); 
                });
            }
        }
    });
};

module.exports.makeMainHtml = function(filelist)  // 업로드 관리자 페이지 생성 모듈
{
    var fileListHtml = makeHtmlFileList(filelist);

    if (filelist.length == 0)
        fileListHtml ='<p>업로드된 파일이 없습니다.<p>';

    var output =`
    <!DOCTYPE html>
<html>
<meta charset="UTF-8" />
<body style="text-align: center">

    
    <p>주문서 업로드</p>
    <hr width=80%>
    <br>
    ${fileListHtml}
    <br>
    <hr width=80%>
    <br>

    <form action="upload" method="post" enctype="multipart/form-data">
        <p><input type="file" name="userfile" onchange="checkFile(this)"><p><br>
        <p><input type="submit" id='submitButton' value="파일업로드" disabled></p>
    </form>

    <br><br><br><p><input type="button" id ="btn_home" value="홈으로" /></p>
    
    <script>
        function checkFile(f) {
            var submitButton = document.getElementById('submitButton');
            submitButton.disabled = true;

            var file = f.files;
            var temp = file[0].name.split(".");

            if (temp[1] != 'xlsx') {
                alert('엑셀파일이 아닙니다 : ' + file[0].name);
                f.outerHTML = f.outerHTML; // 폼초기화;
            }
            else {
                submitButton.disabled = false;
            }
        }

        document.getElementById("btn_home").addEventListener('click', function() {
            location.href ="/";
        });
    </script>

</body>

</html>
    `;

    return output;

}

module.exports.makeTotalOrderFile = function(callback)  //업로드된 데이터 파일을 모두 오픈해서, 머지작업 후  totalorder.xlsx 을 저장한다.
{
    makeExcelMerge(function(jsonData) {
        var xlsfile = json2xls(jsonData);
        fs.writeFileSync('data_download/totalorder.xlsx', xlsfile, 'binary');
        callback();
    });
}


function makeExcelMerge(callback) // 업로드 폴더에 있는 모든 엑셀파일을 오픈해서 Json으로 머지.
{
    var jasonObject;

    fs.readdir('data_upload', function (error, filelist) {   

        if (filelist.length == 0)
            callback(jasonObject);

        var i = 0;
        for (i =0; i < filelist.length; i++)
        {
            var fileFullPath = 'data_upload/' + filelist[i];
            excelFile2json(fileFullPath, function(data){
                if (i ==0)
                    jasonObject = data;
                else
                {
                    for (var k =0; k < data.length; k++)
                     jasonObject.push(data[k]);
                }

                if (i+1 == filelist.length) // 마지막파일 까지 다 한거다.
                    callback(jasonObject);
            });
        }

    });
}

function excelFile2json(fileFullPath, callback)  // 엑셀파일을 제이슨으로 변경.
{
    var resData;

    var workbook = xlsx.readFile(fileFullPath);
    var sheetnames = Object.keys(workbook.Sheets);

    let i = sheetnames.length;

    while (i--) {
        var sheetname = sheetnames[i];
        resData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetname]);
    }

    callback(resData); 
}


function makeFileInfo(fileName, callback) // 파일정보생성
{
    var fileInfo;
    fs.stat('data_upload/' + fileName, function (err, stats) {
        if (err) console.log(err);
        else 
        {
            fileInfo = fileName; 
            callback(fileInfo);
        }
    });
}


function makeHtmlFileList(fileList) // 파일 삭제를 위한 폼 생성.
{
    var output = ``;
    for (var i = 0; i < fileList.length; i++) {
        output += `
        <p>
       <form action="/delete" method="post">
        ${fileList[i]} <input type="submit" value="삭제">
        <input type="hidden" name="filename" value="${fileList[i]}">
        </form>
        </p>
        `;
    }

    return output;

}

var isEmpty = function (value) {
    if (value == "" || value == null || value == undefined || (value != null && typeof value == "object" && !Object.keys(value).length)) { return true }
    else { return false }
};

