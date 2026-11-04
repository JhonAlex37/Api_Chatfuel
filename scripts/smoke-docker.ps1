param([string]$Image='api-chatfuel:1.0.1-unificada')
$ErrorActionPreference='Stop'
& docker run --rm --network none --entrypoint node $Image scripts/smoke-unified.mjs
if($LASTEXITCODE -ne 0){throw 'Falló la comprobación de la API unificada en la imagen.'}
