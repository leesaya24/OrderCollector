[웹서버 로컬 구동을 위한 환경 구성 방법]

* 본 웹서버는  Node.js 10.15.1 기반으로 개발되었습니다. 따라서 구동을 위해서 Node.js 설치가 필요합니다.
* 개발및 테스트를 윈도우 환경에서 진행행하였습니다. mac 환경경에서 테스트를 못해본 것에 대해 양해해주시길 부탁드립니다.

1. Node.js 설치
  https://nodejs.org/ko/download/ 에서 최신버전의 nodejs 를 다운받아 설치합니다.


2. 소스코드 다운로드 및 환경파일 수정
    
    1) https://github.com/leesaya24/OrderCollector 에서 소스코드를 다운로드 합니다.
    
    2) 다운로드 된 소스코드의 root 폴더를 보면 package.json 라는 파일이 있는데  1.항목에서 설치한 nodejs 실행파일 위치를 지정해주어야 합니다.
        
        < package.js  내용>
        {
            .
            .
            .
            "runtimeExecutable": "C:/Program Files/nodejs/node.exe"  <---- 이부분을 현재 PC의 node 실행파일이 있는 위치로 지정해주어야 합니다.
            .
            .
            .
        }

3. 웹서버 실행

    1) 최초실행 
        최초실행 시에는 nodejs 서버가 필요한 모듈을 다운로드해야 합니다. 
        따라서 start_server.bat(mac에서는 start_server_sh.sh) 한번실행 해주면  필요한 모듈을 자동 다운로드하고 서버가 스타트 됩니다.

    2) 재실행
         터미널 창에서  " node server.js " 만 입력하시면 서버가 스타트 됩니다.

    3) 서버스타트 확인
        웹서버가 정상적으로 실행되면 "Start server on localhost:3000" 이란 문구가 터미널 창에 표시됩니다.
        이후 웹브라우저를 통해 localhost:3000로 접근하면 홈화면을 볼 수 있습니다.



[소스코드 설명]

1) ./server.js  : nodejs의 express 웹서버를 실행을 구현한 부분입니다.
2) ./modul/main.js : 웹 클라이언트의 GET/POST 요청을 처리 하기 위한 곳입니다.
3) ./modul/utils.js : 파일처리, 파싱, 동적html 생성등 위한 유틸리티 함수들을 구현한 곳입니다.


[Client side]
1) ./views/home.html : 메인홈페이지 구현입니다.  "업로드 관리페이지"이동과 "최종주문서 다운로드"를 위한 버튼이 위치합니다.
2) ./views/downError.html : 주문서 다운로드 에러를 처리하기 위한 페이지 구현입니다. 
3) 업로드 관리페이지 : 웹서버에서 동적으로 생성해서 보여주는 페이지입니다. ./modul/utils.js 쪽에 구현되어 있습니다.






