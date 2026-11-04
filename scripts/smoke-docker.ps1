param([string]$Image='api-chatfuel:2.1.17')
$ErrorActionPreference='Stop'
$taskContainerName='api-chatfuel-smoke-'+[Guid]::NewGuid().ToString('N').Substring(0,8)
$taskContainerId=$null
try {
 $taskContainerId=(& docker run --detach --rm --name $taskContainerName --publish 127.0.0.1::3000 --env CHATFUEL_BOT_ID=local-smoke-bot --env CHATFUEL_API_TOKEN=local-smoke-token --env CHATFUEL_BOOKING_SECRET=local-smoke-secret-for-testing-only-123456 --env AI_FIRST_ONE_BASE_URL=https://crm.example.invalid --env AI_FIRST_ONE_APPOINTMENTS_TOKEN=local-smoke-token --env HANDOFF_SYNC_ENABLED=false $Image).Trim()
 if($LASTEXITCODE -ne 0 -or $taskContainerId -notmatch '^[0-9a-f]{64}$'){throw 'Container did not start'}
 $taskBinding=(& docker port $taskContainerId 3000/tcp).Trim()
 if($LASTEXITCODE -ne 0 -or $taskBinding -notmatch '^127\.0\.0\.1:\d+$'){throw 'Local port unavailable'}
 $taskBaseUrl='http://'+$taskBinding
 $taskHealth=$null
 foreach($attempt in 1..10){
  try {$taskHealth=Invoke-RestMethod -Uri ($taskBaseUrl+'/health') -TimeoutSec 2; break}
  catch {if($attempt -eq 10){throw}; Start-Sleep -Milliseconds 200}
 }
 if(-not $taskHealth.ok -or $taskHealth.version -ne '2.1.17' -or $taskHealth.handoff.enabled){throw 'Unexpected health response'}
 $taskHeaders=@{Authorization='Bearer local-smoke-secret-for-testing-only-123456'}
 $taskBody=@{contactId='wa_cfPreview:local-independent-smoke';operation='start'} | ConvertTo-Json
 $taskPreview=Invoke-RestMethod -Uri ($taskBaseUrl+'/booking') -Method Post -Headers $taskHeaders -ContentType 'application/json' -Body $taskBody -TimeoutSec 5
 if($taskPreview.done -ne 'si' -or $taskPreview.human -ne 'no'){throw 'Preview response failed'}
 $taskUnauthorizedStatus=0
 try {Invoke-WebRequest -Uri ($taskBaseUrl+'/booking') -Method Post -ContentType 'application/json' -Body $taskBody -UseBasicParsing -TimeoutSec 5 | Out-Null}
 catch {if($_.Exception.Response){$taskUnauthorizedStatus=[int]$_.Exception.Response.StatusCode}else{throw}}
 if($taskUnauthorizedStatus -ne 401){throw 'Authentication check failed'}
 $taskRuntime=(& docker exec $taskContainerId bun --version).Trim()
 if($LASTEXITCODE -ne 0){throw 'Runtime version unavailable'}
 [pscustomobject]@{ok=$true;version=$taskHealth.version;bun=$taskRuntime;health=$true;preview=$true;unauthorized_rejected=$true;real_credentials_used=$false;real_records_created=$false} | ConvertTo-Json -Compress
}finally{
 if($taskContainerId -match '^[0-9a-f]{64}$'){& docker stop $taskContainerId | Out-Null}
}
