@echo off
goto :Run

:utils
  call %~dp0batchutils.bat %*
  goto :eof

:GetDB2Path
  setlocal
    call :utils :RegQuery ^
                DB2_PATH_NAME ^
                "HKEY_LOCAL_MACHINE\SOFTWARE\IBM\DB2" ^
                "DB2 Path Name"
  endlocal & set "%1=%DB2_PATH_NAME%"
  goto :eof

:Run
  setlocal
    call :GetDB2Path DB2PATH
    call :utils :PathPrepend %DB2PATH%
  endlocal & set "PATH=%PATH%"
  echo %PATH%
