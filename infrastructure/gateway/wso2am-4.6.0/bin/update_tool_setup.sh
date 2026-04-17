#!/bin/bash
#
# Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
#
# This software is the property of WSO2 LLC. and its suppliers, if any.
# Dissemination of any information or reproduction of any material contained
# herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
# You may not alter or remove any copyright or other notice from copies of this content.
#
supported_os=""
supported_arch=""
product_name=""
product_base_version=""

fetch_download_links_output=("")

script_abs_path=$(cd -- "$(dirname -- $0)" && pwd)
u2_success_status_code=200
u2_not_found_status_code=404
u2_tool_name_common_prefix="wso2update_"
u2_response_file="${script_abs_path}/u2_response.json"
product_info_path="${script_abs_path}/../updates/product.txt"
base_url="https://api.updates.wso2.com/updates/1.0.0"
u2_docs_url="https://updates.docs.wso2.com/en/latest"
u2_doc_troubleshoot_url="${u2_docs_url}/updates/troubleshoot/#troubleshooting-the-update-tool-setup"
u2_nonce="72208502697246230849367939184092"
regex_product_name_and_base_version='^([0-9a-zA-Z-]+)-([0-9]+\.[0-9]+\.[0-9]+)$'
regex_download_links_arr='"download-links":\[(("[^"]+",?)+)?\]'
regex_download_link='^https://.*\.zip$'

verbose=false
force_clean=false
action_clean=false
action_fetch_all=false

ansi_c=$(tput sgr0)                     # ANSI code to clear formatting
ansi_b=$(tput bold)                     # ANSI code for bold text
ansi__r=$(tput setaf 1)                 # ANSI code for red text
ansi_b_r=$(tput bold; tput setaf 1)     # ANSI code for bold red text
ansi__cy=$(tput setaf 6)                # ANSI code for cyan text

# Print a message in verbose mode.
#
# $@ - The messages to print
echo_verbose () {
    if $verbose
    then
        if [ $# -gt 0 ]
        then
            echo "${ansi__cy}DEBUG:${ansi_c} $@"
        else
            echo
        fi
    fi
}

# Print an error message.
#
# $@ - The messages to print
echo_error () {
    if [ $# -gt 0 ]
    then
        echo "${ansi__r}ERROR:${ansi_c} $@"
    else
        echo
    fi
}

# Print the usage documentation of the script.
usage () {
    echo -e "${ansi_b}NAME${ansi_c}"
    echo -e "    ${ansi_b}$(basename $0)${ansi_c} - Set up the WSO2 Update Tool in the product"
    echo
    echo -e "${ansi_b}SYNOPSIS${ansi_c}"
    echo -e "    ${ansi_b}$(basename $0)${ansi_c} [${ansi_b}-h${ansi_c}] [${ansi_b}-v${ansi_c}] [${ansi_b}-a${ansi_c}] \
[${ansi_b}-c${ansi_c}]"
    echo
    echo -e "${ansi_b}DESCRIPTION${ansi_c}"
    echo -e "    Set up (download and extract) the WSO2 Update Tool compatible with the current OS and architecture \
of the system, provided the product supports the system's OS and architecure." | fmt
    echo -e "    It also supports fetching all the WSO2 Update Tools for OSs and architectures supported by the \
product." | fmt
    echo
    echo -e "${ansi_b}OPTIONS${ansi_c}"
    echo -e "    -h, --help"
    echo -e "    \tDisplay this help output"
    echo
    echo -e "    -v, --verbose"
    echo -e "    \tEnable verbose mode with detailed logging"
    echo
    echo -e "    -a, --all"
    echo -e "    \tSet up Update Tool binaries for all OSs and architectures supported by the product"
    echo
    echo -e "    -c, --clean"
    echo -e "    \tRemove all instances of Update Tool binaries"
    echo
    echo -e "    --force-clean"
    echo -e "    \tRemove all instances of Update Tool binaries (without prompt)"
    echo
    echo -e "${ansi_b}EXAMPLES${ansi_c}"
    echo -e "    # Set up the Update Tool for the current OS and architecture"
    echo -e "    $(basename $0)"
    echo
    echo -e "    # Set up the Update Tools for all supported OSs and architectures"
    echo -e "    $(basename $0) -a"
    echo
    echo -e "    # Enable verbose mode and set up the Update Tool for all supported OSs and architectures"
    echo -e "    $(basename $0) -v -a"
    echo
    echo -e "    # Remove all instances of Update Tool binaries with confirmation prompt"
    echo -e "    $(basename $0) -c"
    echo
    echo -e "    # Force remove all instances of Update Tool binaries without confirmation prompt"
    echo -e "    $(basename $0) --force-clean"
    echo
}

# Clean up the script execution environment.
cleanup () {
    echo_verbose "Cleaning up the script execution environment..."

    if [ -f "$u2_response_file" ]
    then
        echo_verbose "Removing the temporary response file $u2_response_file"
        rm "$u2_response_file"
    fi

    echo_verbose "Completed cleaning up the script execution environment"
    echo_verbose
}

# Clean up the script execution environment and exit with the provided status code.
#
# $1 - The exit status code
cleanup_exit () {
    cleanup
    exit $1
}

# Remove all instances of Update Tool binaries in the product.
#
# $1 - (Optional) Force remove all instances of Update Tool binaries, if true
remove_u2 () {
    local force_remove=${1:-false}

    echo_verbose "Removing all instances of Update Tool binaries..."
    local u2_tool_files=($(find "${script_abs_path}" -name "${u2_tool_name_common_prefix}*" -exec basename {} ';'))

    if [ ${#u2_tool_files[@]} -eq 0 ]
    then
        echo "No Update Tool binaries found"
        cleanup_exit 0
    fi

    echo "The following Update Tool binaries will be removed:"
    for file in "${u2_tool_files[@]}"
    do
        echo "  $file"
    done

    if [ "$force_remove" = false ]
    then
        read -n 1 -ep "Do you want to continue? [y/N]: " confirm_remove
        confirm_remove=${confirm_remove:-"n"}
        confirm_remove=$(echo $confirm_remove | tr '[:upper:]' '[:lower:]')

        if [ "${confirm_remove}" != "y" ]
        then
            echo "Update Tool binaries removal aborted"
            cleanup_exit 0
        fi
    fi

    for file in "${u2_tool_files[@]}"
    do
        echo_verbose "Removing $file..."
        rm "$script_abs_path/$file"
    done

    echo_verbose "Successfully removed all instances of Update Tool binaries"
    echo_verbose
}

# Read the current system OS and set the supported OS.
set_os () {
    local os=$(uname -s)

    case $os in
        "Darwin" | "Linux")
            supported_os=$(echo $os | tr '[:upper:]' '[:lower:]')
            ;; 
        *)
            echo_error "Unsupported OS: $os"
            cleanup_exit 1
            ;;
    esac
}

# Read the current system architecture and set the supported architecture.
set_arch () {
    local amd64_archs=("x86_64", "amd64")
    local arm_archs=("aarch64", "arm64")
    local arch=$(uname -m)

    if [[ "${amd64_archs[@]}" =~ "${arch}" ]]
    then
        supported_arch="amd64"
    elif [[ "${arm_archs[@]}" =~ "${arch}" ]]
    then
        supported_arch="arm64"
    else
        echo_error "Unsupported architecture: $arch"
        cleanup_exit 1
    fi
}

# Read the product information from the product information file and set the product name and base version.
set_product_info () {
    local product_info=$(cat "$product_info_path")

    if [[ $product_info =~ $regex_product_name_and_base_version ]]
    then
        product_name=${BASH_REMATCH[1]}
        product_base_version=${BASH_REMATCH[2]}
    else
        echo_error "Invalid product information in $product_info_path: '$product_info'"
        cleanup_exit 1
    fi
}

# Fetch the download links of the Update Tool binaries from the server.
# And set the return value to `fetch_download_links_output`.
#
# $1 - (Optional) Fetch all available Update Tool binaries, if true
fetch_download_links () {
    echo_verbose "Fetching download links of the Update Tool binaries..."
    local fetch_all=${1:-false}

    set_product_info
    echo_verbose "  ${ansi_b}Product name:${ansi_c} $product_name"
    echo_verbose "  ${ansi_b}Product base version:${ansi_c} $product_base_version"
    local query_params="product-name=${product_name}&product-base-version=${product_base_version}&channel=full"

    if [ "$fetch_all" = false ]
    then
        set_os
        set_arch
        echo_verbose "  ${ansi_b}OS:${ansi_c} $supported_os"
        echo_verbose "  ${ansi_b}Architecture:${ansi_c} $supported_arch"
        local query_params="${query_params}&os=${supported_os}&arch=${supported_arch}"
    fi

    local supported_arch_response_status_code=$(curl -s -w "%{http_code}\n" -o "$u2_response_file" -L \
        "${base_url}/supported-architectures?${query_params}" --header "WSO2-Nonce: ${u2_nonce}")
    if [ $supported_arch_response_status_code -ne $u2_success_status_code ]
    then
        echo_error "Failed to fetch download links of the Update Tool binaries"
        if [ $supported_arch_response_status_code -eq $u2_not_found_status_code ]
        then
            echo_error "Product '${product_name}-${product_base_version}' not found"
        fi
        echo_verbose "${ansi_b}Status code:${ansi_c} $supported_arch_response_status_code"
        echo_verbose "${ansi_b}Response:${ansi_c} ${supported_arch_response}"
        cleanup_exit 1
    fi

    local supported_arch_response=$(cat "$u2_response_file")
    if [[ $supported_arch_response =~ $regex_download_links_arr ]]
    then
        local download_links_arr=${BASH_REMATCH[1]}
        fetch_download_links_output=($(echo $download_links_arr  | grep -o '"[^"]*"' | grep -o '[^"]*'))
    else
        echo_error "Unexpected response received from the server"
        echo_verbose "${ansi_b}Status code:${ansi_c} $supported_arch_response_status_code"
        echo_verbose "${ansi_b}Response:${ansi_c} ${supported_arch_response}"
        cleanup_exit 1
    fi

    echo_verbose "Successfully fetched download links of the Update Tool binaries"
    echo_verbose
}

# Download and extract the Update Tool archives from the given download links.
#
# $@ - The download links of the Update Tool archives
download_and_extract_utool_archives () {
    echo_verbose "Downloading and extracting the Update Tool archives..."
    local download_links=($@)

    for download_link in "${download_links[@]}"
    do
        if [[ ! $download_link =~ $regex_download_link ]]
        then
            echo_verbose "Skipping invalid download link $download_link"
            continue
        fi

        zip_file_name=$(echo ${download_link} | grep -o '[^/]*\.zip')

        if [ ! -f $zip_file_name ]
        then
            echo "Downloading archive $zip_file_name"
            echo $download_link
            curl -f -o "$script_abs_path/$zip_file_name" --progress-bar -L $download_link \
                --header "WSO2-Nonce: ${u2_nonce}"
            if [ $? -ne 0 ]
            then
                echo_error "Failed to download $zip_file_name"
                continue
            fi
        fi

        echo_verbose "Extracting archive $zip_file_name"
        unzip -oq -d "$script_abs_path" "$script_abs_path/$zip_file_name"
        if [ $? -ne 0 ]
        then
            echo_error "Failed to extract $zip_file_name"
        fi

        echo_verbose "Removing archive $zip_file_name"
        rm "$script_abs_path/$zip_file_name"
        echo
    done

    echo_verbose "Successfully downloaded and extracted the Update Tool archives"
    echo_verbose
}

# Main script logic
for arg_index in $(seq $#)
do
    arg=${!arg_index}

    case $arg in
        "-h" | "--help")
            usage
	    exit 0
	    ;;
        "-v" | "--verbose")
            verbose=true
            ;;
        "-c" | "--clean")
            action_clean=true
            ;;
        "--force-clean")
            action_clean=true
            force_clean=true
            ;;
        "-a" | "--all")
            action_fetch_all=true
            ;;
    esac
done

if [ $action_clean = true ]
then
    echo "${ansi_b}Removing all instances of Update Tool binaries...${ansi_c}"
    remove_u2 $force_clean
    echo "${ansi_b}Successfully removed all instances of Update Tool binaries${ansi_c}"
    cleanup_exit 0
fi

if [ $action_fetch_all = true ]
then
    echo "${ansi_b}Downloading and extracting all available Update Tool binaries...${ansi_c}"
    fetch_download_links $action_fetch_all
    if [ ${#fetch_download_links_output[@]} -eq 0 ]
    then
        echo "${ansi_b}NOTE:${ansi_c} No Update Tool binaries available for the product"
        echo "      Detected product: '${product_name}-${product_base_version}'"
        echo "Refer to ${u2_doc_troubleshoot_url} for more information"
        cleanup_exit 0
    fi
    download_and_extract_utool_archives "${fetch_download_links_output[@]}"
    echo "${ansi_b}Successfully downloaded and extracted all available Update Tool binaries${ansi_c}"
    cleanup_exit 0
else
    echo "${ansi_b}Downloading and extracting the supported Update Tool binary...${ansi_c}"
    fetch_download_links
    if [ ${#fetch_download_links_output[@]} -eq 0 ]
    then
        echo "${ansi_b}NOTE:${ansi_c} Product does not support the current system's OS and architecture"
        echo "      Detected system OS: '$(uname -s)', architecture: '$(uname -m)'"
        echo "Refer to ${u2_doc_troubleshoot_url} for more information"
        cleanup_exit 0
    fi
    download_and_extract_utool_archives "${fetch_download_links_output[@]}"
    echo "${ansi_b}Successfully downloaded and extracted the supported Update Tool binary${ansi_c}"
    cleanup_exit 0
fi
