# 학원 내부망 음성채팅 실행

브라우저의 마이크 API는 `HTTPS` 또는 `localhost`에서만 동작한다.
따라서 다른 학원 PC에서 `http://10.x.x.x:5173`으로 접속하면 음성채팅을
사용할 수 없다.

## 1. 서버 PC에서 인증서 만들기

서버 PC의 실제 IPv4 주소를 확인한다.

```powershell
ipconfig
```

프로젝트 루트에서 해당 주소를 넣어 실행한다.

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-dev-https.ps1 -ServerIp 10.1.82.107
```

이 명령은 다음 파일을 만든다.

- `frontend/.cert/dev-https.pfx`: Vite 서버용 개인 인증서
- `frontend/.cert/dev-root-ca.cer`: 각 학원 PC에 설치할 공개 CA 인증서

이 단계에서는 Windows 인증서 신뢰 설정을 자동으로 변경하지 않는다.

`dev-https.pfx`, `dev-root-ca.key`, `dev-server.key`는 개인키를 포함하므로
다른 사람에게 전달하면 안 된다.

## 2. 접속할 PC에서 공개 인증서 신뢰하기

서버 PC와 접속할 각 학원 PC에 `dev-root-ca.cer` 파일만 전달한 뒤
PowerShell에서 실행한다.

```powershell
certutil -user -addstore Root .\dev-root-ca.cer
```

이 명령은 해당 개발 CA를 현재 Windows 사용자에게 신뢰하도록 등록한다.
학원 시연이 끝난 뒤에는 Windows의 `사용자 인증서 관리`에서
`AI Exhibition Development Root CA`를 삭제할 수 있다.

Chrome 또는 Edge를 완전히 종료했다가 다시 실행한다.

## 3. 서버 실행과 접속

서버 PC에서 프로젝트를 다시 시작한다.

```powershell
.\scripts\dev.cmd restart
```

다른 학원 PC에서는 다음 주소로 접속한다.

```text
https://10.1.82.107:5173
```

처음 음성채팅의 `참여하기`를 누르면 브라우저의 마이크 권한을 허용한다.

## 확인할 점

- 모든 PC가 같은 학원 네트워크에 연결되어 있어야 한다.
- Windows 방화벽에서 Node.js의 개인 네트워크 접근을 허용해야 한다.
- 서버 PC의 IP가 바뀌면 새 IP로 인증서를 다시 만들어야 한다.
- 두 사용자는 같은 전시관에 입장한 상태여야 한다.
