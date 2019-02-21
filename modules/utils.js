var fs = require('fs');
const xlsx = require('xlsx');  
const json2xls = require('json2xls');

module.exports.getUploadFileList = function (callback) {  // 이넘을 호출하는 위치에서 구현하는 거임

    // 파일리스트를 구해서 html 형식으로 리턴

    var fileInfos = new Array();

    fs.readdir('data_upload', function (error, filelist) {   // 파일 리스트를 구한거고

        if (!filelist)
            callback(fileInfos);
        else {
            for (var i = 0; i < filelist.length; i++) {  // 파일 정보를 구함 ( 파일 생성일)
                var fileName = filelist[i];

                makeFileInfo(fileName, function (result) {
                    fileInfos.push(result);

                    if (fileInfos.length == filelist.length)
                        callback(fileInfos); // 콜백함수 리턴 타이밍은 비동기 작업이 완료되는 시점에서 호출하는 거임.
                });
            }
        }
    });
};

module.exports.makeHtml = function(fileInfos)
{
    var output='';

    for (var i =0; i < fileInfos.length; i++)
    {
        output += '<p>'+fileInfos[i]+'    <input type="button" value="지우기" />'+'</p>';
    }

    return output;
}

module.exports.makeMainHtml = function(filelist)  // 동적 메인페이지를 생성하는 펑션.
{
    // filelist 는 순수하게 넘어온 파일리스트이다.

    var fileListHtml = makeHtmlFileList(filelist);



    // 여기서 버튼에 대한 스크립트를 구해야 겠네

    // filelist 는 순수파일이름 리스트 이다.  이놈을 가지고 자바스크립트를 새로 구하자.
     var scripts = makeScripts(filelist);

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

module.exports.makeTotalOrderFile = function(callback)  // 제이슨 머지
{
    // 업로드된 데이터 파일을 모두 오픈해서 totalorder.xlsx 을 저장한다.

    makeExcelMerge(function(jsonData) {
        var xlsfile = json2xls(jsonData);
        fs.writeFileSync('data_download/data.xlsx', xlsfile, 'binary');
        callback();
    });

}


function makeExcelMerge(callback)
{
    //var data = {};
    //var strdata = JSON.stringify(data);
    var jasonObject;

    fs.readdir('data_upload', function (error, filelist) {   // 파일 리스트를 구한거고

        if (filelist.length == 0)
            callback(jasonObject);

        // 각 파일들에게서 제이슨 데이터를 수집하고
        // 다시 엑셀파일로 라이트 한다.
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

function excelFile2json(fileFullPath, callback)
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












function makeFileInfo(fileName, callback)
{
    var fileInfo;
    fs.stat('data_upload/' + fileName, function (err, stats) {
        if (err) console.log(err);
        else 
        {
            //fileInfo = fileName+' : '+stats.size+' '+stats.mtime;
            fileInfo = fileName; // 일단은 파일 네임만 던져준다.
            callback(fileInfo);
        }
    });
}



function makeScripts(fileList)
{
    var output =``;

    for (var i =0; i < fileList.length; i++)
    {
        output += `
            document.getElementById("${fileList[i]}").addEventListener('click', function() {
                location.href = "/deleteFile/?filename=${fileList[i]}";
            });`
    }

    return output;

}

function makeHtmlFileList(fileList)
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

