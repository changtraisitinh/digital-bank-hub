<#
.SYNOPSIS
    Set up the WSO2 Update Tool in the product.
.DESCRIPTION
    Set up (download and extract) the WSO2 Update Tool compatible with the current architecture of the system, 
    provided the product supports the system's OS and architecure.
    It also supports fetching all the WSO2 Update Tools for OSs and architectures supported by the product.
.PARAMETER ShowHelp
    Flag to display the help message for the script.
.PARAMETER EnableDebug
    Flag to enable debug mode with verbose logs.
.PARAMETER GetAllBinaries
    Flag to fetch all the available binaries compatible with the product, 
    else only the binary supported by the current system is fetched.
.PARAMETER CleanU2Binaries
    Flag to remove all instances of Update Tool binaries in the product.
.PARAMETER ForceCleanU2Binaries
    Flag to force remove all instances of Update Tool binaries in the product.
.EXAMPLE
    .\update_tool_setup.ps1
    Set up the Update Tool based on the current system architecture and the product compatibility.
.EXAMPLE
    .\update_tool_setup.ps1 -a
    Set up the Update Tools for all product supported OSs and architectures.
.EXAMPLE
    .\update_tool_setup.ps1 -v -a
    Enable verbose output and set up the Update Tools for all product supported OSs and architectures.
.EXAMPLE
    .\update_tool_setup.ps1 -v -c
    Enable verbose output and remove all instances of Update Tool binaries with confirmation prompt.
.EXAMPLE
    .\update_tool_setup.ps1 -ForceClean
    Remove all instances of Update Tool binaries without prompting.
.EXAMPLE
    .\update_tool_setup.ps1 -?
    Display the help message for the script.
.NOTES
    Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
    
    This software is the property of WSO2 LLC. and its suppliers, if any.
    Dissemination of any information or reproduction of any material contained
    herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
    You may not alter or remove any copyright or other notice from copies of this content.
#>
param (
    [Alias("Help", "h")]
    [switch] $ShowHelp,
    [Alias("Verbose", "v")]
    [switch] $EnableDebug,
    [Alias("All", "a")]
    [switch] $GetAllBinaries,
    [Alias("Clean", "c")]
    [switch] $CleanU2Binaries,
    [Alias("ForceClean")]
    [switch] $ForceCleanU2Binaries
)

$U2DefaultDebugPreference = $global:DebugPreference
$U2ToolNameCommonPrefix = "wso2update_"
$U2ProductInfoFilepath = "$PSScriptRoot\..\updates\product.txt"
$U2DownloadDir = "temp-update-tool"
$U2DownloadDirPath = "$PSScriptRoot\$U2DownloadDir"
$U2BaseUrl = "https://api.updates.wso2.com/updates/1.0.0"
$U2DocUrl = "https://updates.docs.wso2.com/en/latest"
$U2DocTroubleshootUrl = "$U2DocUrl/updates/troubleshoot/#troubleshooting-the-update-tool-setup"
$U2Nonce = "72208502697246230849367939184092"

function Initialize-U2Setup {
    <#
    .SYNOPSIS
        Initialize the update tool setup.
    #>

    if ( $EnableDebug ) {
        $global:DebugPreference = "Continue"
    }

    Write-Debug "Initializing the Update Tool setup process..."
    if ( Test-Path -Path "$U2DownloadDirPath" ) {
        Write-Debug "Removing existing temporary Update Tool download directory..."
        Remove-Item -Path "$U2DownloadDirPath" -Recurse -Force
    }

    New-Item -Path "$PSScriptRoot\" -Name "$U2DownloadDir" -ItemType "Directory" | Out-Null
}

function Clear-U2Setup {
    <#
    .SYNOPSIS
        Cleanup the update tool setup.
    #>

    Write-Debug "Cleaning up the update tool setup..."
    if ( Test-Path -Path "$U2DownloadDirPath" ) {
        Remove-Item -Path "$U2DownloadDirPath" -Recurse -Force
    }

    Write-Debug "Setting the debug preference to default..."
    $global:DebugPreference = $U2DefaultDebugPreference
}

function Exit-U2Setup {
    <#
    .SYNOPSIS
        Exit the update tool setup process with the given exit code.
    .PARAMETER ExitCode
        The exit code to exit the update tool setup process.
    #>

    param (
        [int] $ExitCode
    )

    Write-Output "Exiting the Update Tool setup process..."
    Clear-U2Setup
    exit $ExitCode
}

function Remove-U2ToolBinaries {
    <#
    .SYNOPSIS
        Remove all instances of the Update Tool binaries in the product.
    .PARAMETER ForceRemove
        Flag to force remove all instances of the Update Tool binaries.
    #>

    param (
        [boolean] $ForceRemove
    )

    Write-Debug "Removing all instances of the Update Tool binaries..."
    $Binaries = Get-ChildItem -Path "$PSScriptRoot" -Filter "$U2ToolNameCommonPrefix*"

    if ( $Binaries.Count -eq 0 ) {
        Write-Warning "No Update Tool binaries found in the product."
        Exit-U2Setup -ExitCode 0
    }

    Write-Output "The following Update Tool binaries will be removed:"
    ForEach ( $Binary in $Binaries ) {
        Write-Output "  $($Binary.Name)"
    }

    if ( -Not $ForceRemove ) {
        $Confirmation = Read-Host "Do you want to continue? (Y/N)"
        if ( $Confirmation -NotIn "Y", "y" ) {
            Write-Output "Update Tool binaries removal cancelled."
            Exit-U2Setup -ExitCode 0
        }
    }

    ForEach ( $Binary in $Binaries ) {
        Write-Debug "Removing: $($Binary.Name)..."
        Remove-Item -Path $Binary.FullName -Force
    }

    Write-Debug "Successfully removed all instances of the Update Tool binaries."
}

function Get-U2ProcessorArchitecture {
    <#
    .SYNOPSIS
        Get the processor architecture of the current system.
    .OUTPUTS
        The processor architecture of the current system.
    #>

    Switch ( $env:PROCESSOR_ARCHITECTURE ) {
        "AMD64" {
            return "amd64"
        }
        {($_ -eq "ARM") -Or ($_ -eq "ARM64")} {
            return "arm64"
        }
        default {
            Write-Warning "Unsupported processor architecture: $env:PROCESSOR_ARCHITECTURE"
            Write-Warning "Only AMD64 and Arm64 architectures are supported."
            Exit-U2Setup -ExitCode 0
        }
    }
}

function Get-U2ProductInfo {
    <#
    .SYNOPSIS
        Get the product information from the product information file.
    .PARAMETER ProductInfoFilepath
        The file path to the product information file.
    .OUTPUTS
        The product information (name and base version).
    #>

    param (
        [string] $ProductInfoFilepath
    )

    $ProductInfoString = Get-Content -Path $ProductInfoFilepath
    $ProductInfo = New-Object PsObject -Property @{
        Name = $ProductInfoString.Substring(0, $ProductInfoString.LastIndexOf("-"))
        BaseVersion = $ProductInfoString.Substring($ProductInfoString.LastIndexOf("-") + 1)
    }
    return $ProductInfo
}

function Get-U2DownloadLinks {
    <#
    .SYNOPSIS
        Fetch the download link of the Update Tool binary compatible with the product and the system.
    .PARAMETER GetAllLinks
        Flag to fetch all available download links of the Update Tool binaries compatible with the product.
    .OUTPUTS
        List of Update Tool archive download links.
    #>

    param (
        [boolean] $GetAllLinks
    )

    Write-Debug "Fetching download links from the update server..."
    if ( -Not ( Test-Path -Path $U2ProductInfoFilepath -PathType Leaf ) ) {
        Write-Error "Product information file not found: $U2ProductInfoFilepath"
        Exit-U2Setup -ExitCode 1
    }

    $ProductInfo = Get-U2ProductInfo -ProductInfoFilepath $U2ProductInfoFilepath
    Write-Debug "Product name: $($ProductInfo.Name)"
    Write-Debug "Product base version: $($ProductInfo.BaseVersion)"

    $QueryParams = "product-name=$($ProductInfo.Name)&product-base-version=$($ProductInfo.BaseVersion)&channel=full"

    if ( -Not $GetAllLinks ) {
        $ProcessorArchitecture = Get-U2ProcessorArchitecture
        Write-Debug "Processor architecture: $ProcessorArchitecture"

        $QueryParams += "&os=windows&arch=$ProcessorArchitecture"
    }

    $Headers = @{"WSO2-Nonce" = $U2Nonce}
    $Uri = "$U2BaseUrl/supported-architectures?$QueryParams"

    $U2JsonResponse = try {
        Invoke-RestMethod -Method Get -Headers $Headers -Uri $Uri
    } catch {
        $exception = $_.Exception
        $StatusCode = [int]$exception.Response.StatusCode
        Write-Error "Failed to fetch download links from the update server."
        if ( $StatusCode -eq 404 ) {
            Write-Error "Product '$($ProductInfo.Name)-$($ProductInfo.BaseVersion)' not found."
        }
        Write-Debug "Failed status code: $StatusCode"
        Write-Debug "Failed response: $($exception.Response)"
        Exit-U2Setup -ExitCode 1
    }

    Write-Debug "Successfully fetched download links from the update server."
    Write-Debug "Download links: $($U2JsonResponse.'download-links')"
    return $U2JsonResponse.'download-links'
}

function Copy-U2ToolArchives {
    <#
    .SYNOPSIS
        Download the update tool archives using the given download links.
    .PARAMETER DownloadLinks
        The download links to the update tool archives.
    #>

    param (
        [string[]] $DownloadLinks
    )

    Write-Debug "Downloading the update tool archives..."
    ForEach ( $DownloadLink in $DownloadLinks ) {
        $ArchiveName = $DownloadLink -Split "/" | Select-Object -Last 1
        $ArchiveFilepath = "$U2DownloadDirPath\$ArchiveName"

        Write-Debug "Downloading archive: $ArchiveName"
        $DefaultProgressPreference = $ProgressPreference
        try {
            $ProgressPreference = "SilentlyContinue"
            $Headers = @{"WSO2-Nonce" = $U2Nonce}
            Invoke-WebRequest -Headers $Headers -Uri $DownloadLink -OutFile $ArchiveFilepath
        } catch {
            $Exception = $_.Exception
            Write-Error "Failed to download the update tool archive $ArchiveName."
            Write-Debug "Failed response: $($Exception.Response)"
            Exit-U2Setup -ExitCode 1
        } finally {
            $ProgressPreference = $DefaultProgressPreference
        }
    }

    Write-Debug "Successfully downloaded the update tool archives."
}

function Write-U2ExtractToolArchives {
    <#
    .SYNOPSIS
        Extract the update tool archives.
    #>

    Write-Debug "Extracting the update tool archives..."
    $Archives = Get-ChildItem -Path "$U2DownloadDirPath" -Filter "*.zip"

    ForEach ( $Archive in $Archives ) {
        Write-Debug "Extracting archive: $($Archive.Name)"
        Expand-Archive -Path $Archive.FullName -DestinationPath "$PSScriptRoot" -Force
    }

    Write-Debug "Successfully extracted the update tool archives."
}

# Main script logic
if ( $ShowHelp ) {
    $U2ScriptName = $MyInvocation.MyCommand.Name
    Get-Help "$PSScriptRoot\$U2ScriptName" -Detailed
    exit 0
}

Initialize-U2Setup

if ( $CleanU2Binaries -Or $ForceCleanU2Binaries) {
    Write-Output "Removing all instances of Update Tool binaries..."
    Remove-U2ToolBinaries -ForceRemove $ForceCleanU2Binaries
    Write-Output "Successfully removed all instances of Update Tool binaries."
    Exit-U2Setup -ExitCode 0
}

$U2DownloadLinks = @()
if ( $GetAllBinaries ) {
    Write-Output "Downloading and extracting all available Update Tool binaries..."
    $U2DownloadLinks = Get-U2DownloadLinks -GetAllLinks $GetAllBinaries
    if ( $U2DownloadLinks.Count -eq 0 ) {
        $ProductInfo = Get-U2ProductInfo -ProductInfoFilepath $U2ProductInfoFilepath
        Write-Warning "No Update Tool binaries available for the product."
        Write-Output "      Detected product: '$($ProductInfo.Name)-$($ProductInfo.BaseVersion)'"
        Write-Output "Refer to $U2DocTroubleshootUrl for more information."
        Exit-U2Setup -ExitCode 0
    }

    Copy-U2ToolArchives -DownloadLinks $U2DownloadLinks
    Write-U2ExtractToolArchives
    Write-Output "Successfully downloaded and extracted all available Update Tool binaries."
} else {
    Write-Output "Downloading and extracting the supported Update Tool binary..."
    $U2DownloadLinks = Get-U2DownloadLinks -GetAllLinks $GetAllBinaries
    if ( $U2DownloadLinks.Count -eq 0 ) {
        Write-Warning "Product does not support the current system's OS and architecture."
        Write-Output "      Detected system OS: 'Windows', architecture: '$env:PROCESSOR_ARCHITECTURE'"
        Write-Output "Refer to $U2DocTroubleshootUrl for more information."
        Exit-U2Setup -ExitCode 0
    }

    Copy-U2ToolArchives -DownloadLinks $U2DownloadLinks
    Write-U2ExtractToolArchives
    Write-Output "Successfully downloaded and extracted the supported Update Tool binary."
}

Exit-U2Setup -ExitCode 0
