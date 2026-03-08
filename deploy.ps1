$processOptions = @{
    FilePath = "shopify.bat"
    ArgumentList = "theme", "push", "--theme", "EcomLanders", "--only", "sections/product-info-advanced.liquid,assets/product-info-advanced.css,assets/product-info-advanced.js"
    RedirectStandardInput = $true
    RedirectStandardOutput = $true
    RedirectStandardError = $true
    UseNewEnvironment = $false
    Wait = $false
}

$proc = Start-Process @processOptions -PassThru
Start-Sleep -Seconds 4
if ($proc -and -not $proc.HasExited) {
    $proc.StandardInput.WriteLine("y")
    $proc.StandardInput.Close()
}
$proc.WaitForExit()
$out = $proc.StandardOutput.ReadToEnd()
$err = $proc.StandardError.ReadToEnd()

"STDOUT: $out" | Out-File deploy-log.txt
"STDERR: $err" | Out-File deploy-log.txt -Append
