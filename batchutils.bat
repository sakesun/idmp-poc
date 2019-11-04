@echo off
call :%*
exit /b %errorlevel%

:DeQuote
  for /f "delims=" %%a in ('echo %%%1%%') do set %1=%%~a
  goto :eof

:RegQuery
  rem Read registry value
  rem >> call :RegQuery RESULT_VAR <PATH> <NAME>
  rem eg:
  rem >> call %~dp0lib.bat :RegQuery DB2_PATH_NAME ^
  rem ..                             "HKEY_LOCAL_MACHINE\SOFTWARE\IBM\DB2" ^
  rem ..                             "DB2 Path Name"
  rem
  setlocal
    set "KEY=%2"
    set "VAL=%3"
    call :DeQuote KEY %KEY%
    call :DeQuote VAL %VAL%
    set "WORDS=0"
    for %%a in (%VAL%) do set /a "WORDS+=1"
    set /a "IDX=%WORDS + 1"
    for /f "skip=2 tokens=%IDX%*" %%a in ('reg query "%KEY%" /v "%VAL%" 2^>NUL') do (
      set "R=%%b"
    )
  endlocal & set "%1=%R%"
  goto :eof

:PathItems
  rem Break semicolon-separated paths into space-separted quoted path
  rem This allow you do to iterate easily:
  rem
  rem >> call :PathItems PATHS "%PATH%"
  rem >> for %%p in (%PATHS%) do echo %%p
  rem
  setlocal enableextensions enabledelayedexpansion
    set "P=%2"
    set "MAX_TRIES=200"
    call :Dequote P %P%
    set "R="
    for /l %%a in (1, 1, %MAX_TRIES%) do (
      for /f "delims=;" %%g in ("!P!") do (
        set "R=!R!^ "%%g^""
        set "P=!P:%%g;=!"
        if "!P!" == "%%g" goto :BR
      )
    )
    :BR
  endlocal & set "%1=%R%"
  goto :eof

:PathPrepend
  rem prepend new path to PATH variable if it is not available yet
  rem
  rem >> call :PathPrepend "%~dp0\bin"
  rem
  setlocal enableextensions enabledelayedexpansion
    set "APPEND=%1"
    call :DeQuote APPEND %APPEND%
    if "!PATH:%APPEND%;=!;"=="!PATH!;" set "PATH=%APPEND%;!PATH!"
  endlocal & set "PATH=%PATH%"
  goto :eof
