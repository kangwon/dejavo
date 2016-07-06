ZB = {};

ZB.statusChangeCallback = function(response) {
	// The response object is returned with a status field that lets the
	// app know the current login status of the person.
	// Full docs on the response object can be found in the documentation
	// for FB.getLoginStatus().
	if (response.status === 'connected') {
		// Logged into your app and Facebook.
		ZB.registerOrLogin(response.authResponse.accessToken);
	} else if (response.status === 'not_authorized') {
		// The person is logged into Facebook, but not your app.
		//FB.login(function(response) {
		//	console.log(response);
		//}, { scope : 'email'});
		FB.login(function(response) {
			ZB.registerOrLogin(response.authResponse.accessToken);
		}, {
			scope : 'email',
		});
	} else {
		// The person is not logged into Facebook,
		// so we're not sure if they are logged into this app or not.
		FB.login(function(response) {
			ZB.registerOrLogin(response.authResponse.accessToken);
		}, {
			scope : 'email',
		});
	}
}

ZB.updateLoginInfo = function(userinfo) {
	var profile = $('#head_container .profile');
	var a = $(document.createElement('a'));
	var a_s = $(document.createElement('span')).text(userinfo.last_name + ' ' + userinfo.first_name);
	a.append(a_s);
	$.each($('.profile-image.vhmiddle-update'), function (i,v) {
		$(this).data('vhmiddle').updateImage(userinfo.profile_image);
	});
	profile.empty().append(a);

	var url = window.location.href;
	var article_view_regex = new RegExp('^(http[s]?:\\/\\/)' + window.location.host + '\\/article\\/([0-9]+)\\/$');

	// if current page if article view page, check whether the user is participating this article or not.
	if (article_view_regex.test(url)){
		var a_id = article_view_regex.exec(url)[2];
		$.ajax({
			'url' : '/account/check_participate/' + a_id + '/',
			'dataType' : 'json',
			'method' : 'GET',
			'success' :  function(response){
				if (response.check) {
					$('li#participate').attr('data-action', 'unparticipate');
					$('li#participate span').text('취소');
				}
			},
		});
	}
}

ZB.isLogin = function() {
	return $('div#profile_container').find('#login_button').length == 0;
};

ZB.login = function (postFunc){
	window.location.replace('/login/');
};

ZB.showAccountDialog = function(){
	var profileDiv = $('#profile_container');

	var dialog = profileDiv.find('#account_dialog');
	if (dialog.length > 0) {
		dialog.fadeIn();
		return;
	}

	dialog = $(document.createElement('div')).attr('id', 'account_dialog');

	var logoutDiv = $(document.createElement('div'));
	var editProfileDiv = $(document.createElement('div'));
	var logout = $(document.createElement('button')).text('로그아웃');
	var editProfile = $(document.createElement('button')).text('마이페이지');

	logoutDiv.append(logout);
	editProfileDiv.append(editProfile);

	dialog.hide();
	dialog.append(logoutDiv).append(editProfileDiv);
	logout.click(function () {
		$.ajax({
			'method' : 'GET',
			'dataType' : 'json',
			'url' : '/logout/',
			'success' : function() {
				window.location = '/';
			},
			'error' : function () {},
		});
	});
	editProfile.click(function () {
		window.location = '/account/';
	});

	var pPosition = profileDiv.offset();

	var leftMargin = (profileDiv.width() - 140) / 2;
	if (leftMargin < 0 && leftMargin > -70) leftMargin = -70;
	pPosition.top+= 65;
	pPosition.left += leftMargin;
	dialog.css({
		'top' : pPosition.top,
		'left' : pPosition.left,
	});
	profileDiv.append(dialog);
	dialog.fadeIn();
};

ZB.removeAccountDialog = function(){
	var dialog = $('#account_dialog');
	dialog.fadeOut('fast', function () {
		dialog.remove();
	});
};

$(document).ready(function(){

	$('.vhmiddle').vhmiddle();

	(function(d, s, id){
		var js, fjs = d.getElementsByTagName(s)[0];
		if (d.getElementById(id)) {return;}
		js = d.createElement(s); js.id = id;
		js.src = "//connect.facebook.net/en_US/sdk.js";
		fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));

	window.fbAsyncInit = function() {
		FB.init({
			appId   : '274526142597066',
			xfbml   : true,
			status  : true,
			cookie  : true,
			version : 'v2.2'
		});
	};
});
