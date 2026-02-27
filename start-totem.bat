@echo off
REM Script de inicialização do Totem Amor por Fotos
REM Compatível com configurações PICGO

REM Obter caminho do script
SET mypath=%~dp0
echo Iniciando Totem Amor por Fotos em: %mypath:~0,-1%
cd /d %mypath:~0,-1%

REM Parar serviço de atualização do Windows
echo Parando serviço de atualização do Windows...
sc stop wuauserv

REM Copiar fonts do PICGO (se existir)
if exist fonts\ (
    echo Copiando fonts...
    xcopy fonts\* %SystemRoot%\fonts /s /e /y /c
)

REM Copiar arquivos do Windows (se existir)
if exist windows\Windows\ (
    echo Copiando arquivos do Windows...
    xcopy windows\Windows\* %SystemRoot% /s /e /y /c
)

REM Matar qualquer instância anterior do Java
taskkill /f /IM java.exe 2>nul

REM Matar qualquer instância anterior do Electron
taskkill /f /IM "Amor por Fotos.exe" 2>nul

REM Aguardar um pouco
timeout /t 2 /nobreak

REM Iniciar o Totem
echo Iniciando aplicação Totem Amor por Fotos...

REM Opção 1: Se usando Electron
if exist "dist-electron\Amor por Fotos.exe" (
    echo Iniciando versão Electron...
    start "" "dist-electron\Amor por Fotos.exe"
    goto :eof
)

REM Opção 2: Se usando Node.js
if exist "dist\index.js" (
    echo Iniciando versão Node.js...
    start "" node dist\index.js
    goto :eof
)

REM Opção 3: Se usando JAR (compatível com PICGO)
if exist "picgo-launcher-1.3-jar-with-dependencies.jar" (
    echo Iniciando versão JAR (PICGO)...
    java -jar picgo-launcher-1.3-jar-with-dependencies.jar
    goto :eof
)

echo Erro: Nenhuma versão da aplicação encontrada!
pause
exit /b 1
