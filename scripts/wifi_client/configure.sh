#!/bin/bash

test "$(whoami)" != 'root' && (echo you are using a non-privileged account; exit 1)


OPTIND=1 # reset in case getopts have been used previously in the shell

ssid="snoopsafe"
passphrase=""
encryption=""

function show_help {
	local me=`basename $0`
	echo 'Usage: '$me' --ssid="<ACCESS POINT NAME>" --passphrase="<ACCESS POINT PASSWORD>" --encryption=None/WEP/WPA'
}

for i in "$@"
do
	case $i in
	--help)
		show_help
		exit 0
		;;
	--ssid=*)
		ssid="${i#*=}"
		shift
		;;
	--passphrase=*)
		passphrase="${i#*=}"
		shift
		;;
	--encryption=*)
		encryption="${i#*=}"
		shift
		;;
	
	esac
done

shift $((OPTIND-1))

[ "$1" = "--" ] && shift

#echo "ssid=$ssid, wpa_passsphrase=$wpa_passphrase', Leftovers: $@"

# replace the ssd and the passphrase in the hostapd config file
sed -i "s/\(wpa-ssid \).*\$/\1\"$ssid\"/" /etc/network/interfaces
sed -i "s/\(wpa-psk \).*\$/\1\"$passphrase\"/" /etc/network/interfaces


sed -i "s/\(wpa-essid \).*\$/\1\"$ssid\"/" /etc/network/interfaces
sed -i "s/\(wpa-key \).*\$/\1\"$passphrase\"/" /etc/network/interfaces

if [ "$encryption" = "WPA" ]; then
	sed -i -e 's/^\twireless-essid/\#\twireless-essid/g' $config_file
	sed -i -e 's/^\twireless-key/\#\twireless-key/g' $config_file
	sed -i -e 's/^\twireless-mode/\#\twireless-mode/g' $config_file

	sed -i -e 's/^\#\twpa-ssid/\twpa-ssid/g' $config_file
	sed -i -e 's/^\#\twpa-psk/\twpa-psk/g' $config_file
elif [ "$encryption" = "WEP" ]; then
	sed -i -e 's/^\twpa-ssid/\#\twpa-ssid/g' $config_file
	sed -i -e 's/^\twpa-psk/\#\twpa-psk/g' $config_file
	sed -i -e 's/^\twireless-mode/\#\twireless-mode/g' $config_file

	sed -i -e 's/^\#\twpa-essid/\twpa-essid/g' $config_file
	sed -i -e 's/^\#\twpa-key/\twpa-key/g' $config_file
else
	sed -i -e 's/^\twpa-ssid/\#\twpa-ssid/g' $config_file
	sed -i -e 's/^\twpa-psk/\#\twpa-psk/g' $config_file
	sed -i -e 's/^\twireless-key/\#\twireless-key/g' $config_file

	sed -i -e 's/^\#\twireless-essid/\twireless-essid/g' $config_file
	sed -i -e 's/^\#\twireless-mode/\twireless-mode/g' $config_file
fi
	

