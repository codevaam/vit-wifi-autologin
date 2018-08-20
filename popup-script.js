
document.addEventListener('DOMContentLoaded', function() {
  var btnLogin = document.getElementById('login');
  var btnSubmit =  document.getElementById('save_form');
  var btnLogout = document.getElementById('logout');
  
  chrome.storage.sync.get(null,function(data){
    if(data.username != (undefined || null)){
      document.getElementById('username').value = data.username;
      document.getElementById('password').value = data.password;
    }
  });
  
  chrome.runtime.onMessage.addListener(
    function(request,sender,sendResponse){
      if(request.network_error){
        setStatus(request.status);
      }
    }
  );
  
  btnLogin.addEventListener('click', function () {
    setStatus('Logging in');
    chrome.runtime.sendMessage({login: true});
    chrome.runtime.onMessage.addListener(
      function(request,sender,sendResponse){
        if(request.login_success == true){
          setStatus('Logged in');
        }
        if(request.login_success == false){
          setStatus('Incorrect credentials');
        }
        if(request.quota_over == true){
          setStatus('Quota over');
        }
        if(request.already_logged_in == true){
          setStatus('Already logged in');
        }
        if(request.login_timed_out == true){
          setStatus('Request Timed out');
        }
      });
    });
    
    btnLogout.addEventListener('click',function () {
      chrome.runtime.sendMessage({logout: true});
      chrome.runtime.onMessage.addListener(
        function(request,sender,sendResponse){
          if(request.logout_success == true){
            setStatus('Logged out');
          }
          if(request.logout_success == false){
            setStatus('No Active Session');
          }
        });
      });
      
      btnSubmit.addEventListener('click', function() {
        
        var form1 = document.getElementById('form1');
        username= form1.elements['username'].value;
        password= form1.elements['password'].value;
        chrome.storage.sync.set({"username": username ,"password": password}, function () {
          setStatus('Saved login data');
        });
      });
    }, false);
  
function setStatus(status_code) {
                          document.getElementById('status').innerHTML = '<strong>' + status_code + '</strong>';
                                }
