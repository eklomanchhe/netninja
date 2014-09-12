
var changes = {
	'internet':false,
	'accesspoint':false,
	'vpn':false,
	'security':false	
};
var success = {
	'internet':false,
	'accesspoint':false,
	'vpn':false,
	'security':false	
}

$( document ).ready(function() {


	$('#navtap a').click(function (e) {
	  e.preventDefault();
	  $(this).tab('show');
	})	
	


	$('#savesettings').click(function (e) {
	  e.preventDefault();
	  savesettings();
	})	



	if ($("#wifi_enabled").is(':checked')) {
		$("#wifi-group").show(0);
	} else {
		$("#wifi-group").hide(0);
	}
	

	
	if ($("#vpntype-private").is(':checked')) {
		$("#private-vpn-group").show(50);
	} else {
		$("#private-vpn-group").hide(50);
	}
	
	$("#vpntype-none").change(function() {
		if ($("#vpntype-none").is(':checked')) {
			$("#private-vpn-group").hide(50);
		}
	});
	
	$("#vpntype-tor").change(function() {
		if ($("#vpntype-tor").is(':checked')) {
			$("#private-vpn-group").hide(50);
		}
	});
	
	$("#vpntype-private").change(function() {
		if ($("#vpntype-private").is(':checked')) {
			$("#private-vpn-group").show(50);
		}
	});
	
	
	
	$("#wifi_enabled").change(function() {
		if ($("#wifi_enabled").is(':checked')) {
			$("#wifi-group").show(50);
		} else {
			$("#wifi-group").hide(50);
		}
	});
	
	$("#vpn_protocol_select_tcp").click(function(event) {
		value = 'tcp';
		$("#vpn_protocol_text").text(value.toUpperCase());
		$("#vpn_protocol").val(value);
	});
	
	$("#vpn_protocol_select_udp").click(function(event) {
		value = 'udp';
		$("#vpn_protocol_text").text(value.toUpperCase());
		$("#vpn_protocol").val(value);
	});
	
	
	// know which section changed
	$(".tab-pane").find("input,textarea").click(function() {
		key = $(this).closest(".tab-pane").attr('id').substring("tab-".length);
		changes[key] =true;
	});
	
	$('#navtab a[href="#internet"]').tab('show') // Select tab by name
	
});


function savesettings() {
	clear_messages();
	
	if (changes["internet"]) {
		saveInternet();
	}
	if (changes["accesspoint"]) {
		saveAccesspoint();
	}
	if (changes["vpn"]) {
		saveVPN();
	}
	if (changes["security"]) {
		savePassword();
	}
}

function saveInternet() {
	notify_pending_change();
	
	wifi_enabled = $("#wifi_enabled").is(":checked");
	ssid = $("#client_wifi_ssid").val();
	password = $("#client_wifi_password").val();
	

	formdata = {
		"wifi_enabled": wifi_enabled,
		"ssid": ssid,
		"password": password
	}

	post_url = "application/internet.php";

		
	$.post(post_url, formdata, function( data ) {
		result = data.result
		if (result == "success") {
			success["internet"] = true;
			notify_success(data);
		} else if (result == "warning"){
			notify_warning(data);
		} else {
			success["internet"] = false;
			notify_error(data);
		}
		$( ".result" ).html( data );
	}, 'json');
	
}

function saveAccesspoint() {
	notify_pending_change();
	
	ssid = $("#accesspoint_wifi_ssid").val();
	password = $("#accesspoint_wifi_password").val();
	

	formdata = {
		"ssid": ssid,
		"password": password
	}

	post_url = "application/accesspoint.php";

		
	$.post(post_url, formdata, function( data ) {
		result = data.result
		if (result == "success") {
			success["accesspoint"] = true;
			notify_success(data);
		} else if (result == "warning"){
			notify_warning(data);
		} else {
			success["accesspoint"] = false;
			notify_error(data);
		}
		$( ".result" ).html( data );
	}, 'json');
	
}

function saveVPN() {
	notify_pending_change();
	is_tor_on = $("#vpntype-tor").is(":checked");
	is_vpn_on = $("#vpntype-private").is(":checked");
	
	service = "none";
	if (is_tor_on) {
		service = "tor";
	} else if (is_vpn_on) {
		service = "private";
	}
	
	
	server = $("#vpn_server").val();
	port = $("#vpn_port").val();
	protocol = $("#vpn_protocol").val();
	username = $("#vpn_username").val();
	password = $("#vpn_password").val();
	ca_cert = $("#vpn_ca_cert").val();

	formdata = {
		"service": service,
		"server": server,
		"port": port,
		"protocol": protocol,
		"username": username,
		"password": password,
		"ca_cert": ca_cert
	}

	post_url = "application/vpn.php";

		
	$.post(post_url, formdata, function( data ) {
		result = data.result
		if (result == "success") {
			success["vpn"] = true;
			notify_success(data);
		} else if (result == "warning"){
			notify_warning(data);
		} else {
			success["vpn"] = false;
			notify_error(data);
		}
		$( ".result" ).html( data );
	}, 'json');
	
}


function savePassword() {
	oldPassword = $("#old_password").val();
	newPassword = $("#new_password").val();
	newPassword_verify = $("#new_password_verify").val();
	
	if (!oldPassword && !newPassword && !newPassword_verify) {
		return;
	}

	notify_pending_change();
	
	formdata = {
		"old_password": oldPassword,
		"new_password": newPassword,
		"new_password_verify": newPassword_verify
	}

	post_url = "application/security.php";
		
	$.post(post_url, formdata, function( data ) {
		result = data.result
		if (result == "success") {
			success["security"] = true;
			notify_success(data);
		} else if (result == "warning"){
			notify_warning(data);
		} else {
			success["security"] = false;
			notify_error(data);
		}
		$( ".result" ).html( data );
	}, 'json');
	
	
	$("#old_password").val("");
	$("#new_password").val("");
	$("#new_password_verify").val("");
	
}

function notify_error(data) {
	$("#pendingchange_banner").hide();
	$("#error_banner").show();
	formErrors = data.response.errors
	if (formErrors["unauthorized"] == true) {
		document.location.href = "/";
		return;
	}
	for (formError in formErrors) {
		$("#error-"+formError).show();
	}	
}
function notify_success(data) {
	ready = true;
	// figure out which changes were made
	for (index in changes) {
		if (success[index] != changes[index]) {
			ready = false;
		}
	}
	if (ready) {
		// reset change index
		for (index in changes) {
			changes[index] = false;
			success[index] = false;
		}

		$("#pendingchange_banner").hide();
		$("#success_banner").show(50);
	}
}
function notify_pending_change() {
	$("#pendingchange_banner").show(50);
}
function notify_warning() {
	
}
function clear_messages() {
	$(".input-error").hide();
}
function show_message_banner() {
	
}