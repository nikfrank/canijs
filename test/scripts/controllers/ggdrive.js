'use strict';

angular.module('canijstest')
  .controller('GgCtrl', function ($scope) {


      $scope.current = '';

      Cani.core.confirm('gapi').then(function(ggd){
	  $scope.ggd = ggd.gapi;
console.log(ggd.conf.user.google);
	  var CLIENT_ID = '480385579995.apps.googleusercontent.com';
	  var SCOPES = 'https://www.googleapis.com/auth/drive';

	  /**
	   * Called when the client library is loaded to start the auth flow.
	   */
	  window.handleClientLoad = function() {
console.log('hcl');
              window.setTimeout(checkAuth, 1);
	  }

	  /**
	   * Check if the current user has authorized the application.
	   */
	  window.checkAuth = function() {
              gapi.auth.authorize(
		  {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true},
		  handleAuthResult);
	  }

	  /**
	   * Called when authorization server replies.
	   *
	   * @param {Object} authResult Authorization result.
	   */
	  window.handleAuthResult = function(authResult) {
console.log(authResult);
              var authButton = document.getElementById('authorizeButton');
              var filePicker = document.getElementById('filePicker');
              authButton.style.display = 'none';
              filePicker.style.display = 'none';
              if (authResult && !authResult.error) {
		  // Access token has been successfully retrieved, requests can be sent to the API.
		  filePicker.style.display = 'block';
		  filePicker.onchange = uploadFile;
              } else {
		  // No access token could be retrieved, show the button to start the authorization flow.
		  authButton.style.display = 'block';
		  authButton.onclick = function() {
		      gapi.auth.authorize(
			  {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
			  handleAuthResult);
		  };
              }
	  }

	  /**
	   * Start the file upload.
	   *
	   * @param {Object} evt Arguments from the file selector.
	   */
	  function uploadFile(evt) {
              gapi.client.load('drive', 'v2', function() {
		  var file = evt.target.files[0];
		  insertFile(file);
              });
	  }

	  /**
	   * Insert new file.
	   *
	   * @param {File} fileData File object to read data from.
	   * @param {Function} callback Function to call when the request is complete.
	   */
	  function insertFile(fileData, callback) {
              var boundary = '-------314159265358979323846';
              var delimiter = "\r\n--" + boundary + "\r\n";
              var close_delim = "\r\n--" + boundary + "--";

              var reader = new FileReader();
              reader.readAsBinaryString(fileData);
              reader.onload = function(e) {
		  var contentType = fileData.type || 'application/octet-stream';
		  var metadata = {
		      'title': fileData.name,
		      'mimeType': contentType
		  };

		  var base64Data = btoa(reader.result);
		  var multipartRequestBody =
		      delimiter +
		      'Content-Type: application/json\r\n\r\n' +
		      JSON.stringify(metadata) +
		      delimiter +
		      'Content-Type: ' + contentType + '\r\n' +
		      'Content-Transfer-Encoding: base64\r\n' +
		      '\r\n' +
		      base64Data +
		      close_delim;

		  var request = gapi.client.request({
		      'path': '/upload/drive/v2/files',
		      'method': 'POST',
		      'params': {'uploadType': 'multipart'},
		      'headers': {
			  'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
		      },
		      'body': multipartRequestBody});
		  if (!callback) {
		      callback = function(file) {
			  console.log(file)
		      };
		  }
		  request.execute(callback);
              }
	  }


		var po = document.createElement('script');
		po.type = 'text/javascript'; po.async = true;
		po.src = 'https://apis.google.com/js/client.js?onload=handleClientLoad';
		var s = document.getElementsByTagName('script')[0];
		s.parentNode.insertBefore(po, s);



      });

  });
