
console.log('Loaded Background Script');

chrome.runtime.onStartup.addListener(function () {
  login(true);
});




function logout(){
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET","http://phc.prontonetworks.com/cgi-bin/authlogout",true);
  xmlhttp.send();
  xmlhttp.onreadystatechange=function(){
    if (xmlhttp.readyState==4 && xmlhttp.status==200){
      var patt_logout = new RegExp("successfully logged out","i");
      var patt_no_active = new RegExp("no active session","i");
      
      if(patt_logout.test(xmlhttp.responseText)){
        chrome.notifications.create('id5',message_prompts.success_logout,function () {
          console.log("logged out");
        });
        chrome.runtime.sendMessage({logout_success: true});
      }
      else if(patt_no_active.test(xmlhttp.responseText)){
        chrome.notifications.create('id6',message_prompts.logout_fail,function () {
          console.log("active session");
        });
        chrome.runtime.sendMessage({logout_success: false});
      }
      else {
        chrome.runtime.sendMessage({logout_unknown_error: true});
      }
    }
  }
}

function login(firstRun) {
  firstRun || (firstRun = false);
  chrome.storage.sync.get(null,function(data) {
    var username = data.username;
    var password = data.password;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST","http://phc.prontonetworks.com/cgi-bin/authlogin",true);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    xmlhttp.timeout = 9000;
    xmlhttp.ontimeout = function () {
      console.log('Request Timed out');
      chrome.runtime.sendMessage({login_timed_out: true});
      chrome.notifications.create('id_timeout',message_prompts.timed_out,function () {
        console.log("Req timeout notification");
      });
    }
    xmlhttp.send("userId="+username+"&password="+password+"&serviceName=ProntoAuthentication&Submit22=Login");
    xmlhttp.onreadystatechange = function () {
      if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
          var patt_success = /congratulations/i;
          var patt_already = /already logged in/i;
          var patt_quota_over = /quota is over/i;
          var patt_sorry = /sorry/i;
          var patt_tryAgain = /try again/i;
          
          if(patt_success.test(xmlhttp.responseText)){
            chrome.notifications.create('id6',message_prompts.success,function () {
            });
            chrome.runtime.sendMessage({login_success: true});
            return 0;
          }
          else if(patt_quota_over.test(xmlhttp.responseText)){
            chrome.notifications.create('id3',message_prompts.quota_over,function () {
              console.log("quota over");
            });
            chrome.runtime.sendMessage({quota_over: true});
            return 2;
          }
          else if(patt_sorry.test(xmlhttp.responseText) && patt_tryAgain.test(xmlhttp.responseText)){
            chrome.notifications.create('id2',message_prompts.login_error,function () {
              console.log("error logging in");
            });
            chrome.runtime.sendMessage({login_success: false});
            return 1;
          }
          else if(patt_already.test(xmlhttp.responseText)){
            if(!firstRun){
              chrome.notifications.create('id4',message_prompts.already_logged_in,function () {
                console.log("already_logged_in");
              });
              chrome.runtime.sendMessage({already_logged_in: true});
              return 3;
            }
          }
          else {
            console.log('Unknown error');
          }
      }
    };
  });
}



var message_prompts = {
  "success": {
    type: "basic",
    title: "Successfully logged in",
    message: "Login Successful",
    iconUrl: "icon128x128.png"
  },
  
  "login_error": {
    type: "basic",
    title: "Incorrect Credentials",
    message: "Please check your details",
    iconUrl: "icon128x128.png"
  },
  
  "already_logged_in": {
    type: "basic",
    title: "Already logged in",
    message: "You can browser the web normally",
    iconUrl: "icon128x128.png"
  },
  
  "quota_over": {
    type: "basic",
    title: "Quota over",
    message: "WiFi Quota Over",
    iconUrl: "icon128x128.png"
  },
  
  "success_logout": {
    type: "basic",
    title: "Logged Out",
    message: "Successfully Logged Out",
    iconUrl: "icon128x128.png"
  },
  
  "logout_fail": {
    type: "basic",
    title: "No Active Session",
    message: "You are already logged out!",
    iconUrl: "icon128x128.png"
  },
  
  "timed_out": {
    type: "basic",
    title: "Request Timed Out",
    message: "Please check your connection, or try again later",
    iconUrl: "icon128x128.png"
  },
  
  "disconnected": {
    type: "basic",
    title: "Wifi Disconnected",
    message: "Please check your connection",
    iconUrl: "icon128x128.png"
  },
  
  "network_change": {
    type: "basic",
    title: "Network Changed",
    message: "Please try again later",
    iconUrl: "icon128x128.png"
  },
  
  "name_unresolved": {
    type: "basic",
    title: "Network Error",
    message: "Cannot Resolve Form URL, Please Reconnect to VIT WiFi",
    iconUrl: "icon128x128.png"
  }
  }
  








chrome.webRequest.onErrorOccurred.addListener(function(details) {
    if (details.error == 'net::ERR_INTERNET_DISCONNECTED') {
      console.log('Wifi Disconnected',details);
      chrome.notifications.create('id_no_wifi',message_prompts.disconnected,function () {
        console.log("No wifi notification");
      });
    }
    if(details.error == 'net::ERR_NETWORK_CHANGED'){
      console.log('Network Changed');
      chrome.notifications.create('id_net_changed',message_prompts.network_change,function () {
        console.log("network changed notification");
      });
    }
    if(details.error == 'net::ERR_NAME_NOT_RESOLVED'){
      console.log('Name not resolved');
      chrome.notifications.create('id_name_not_resolved',message_prompts.name_unresolved,function () {
        console.log("name not resolved notification");
      });
    }
    chrome.runtime.sendMessage({network_error: true, status: "Network error"});
}, {
    urls: ['*://*/*'],
    types: ['xmlhttprequest']
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if(request.error == true){
        console.log("Incorrect cred, closing tab");
        chrome.tabs.query({url: "http://phc.prontonetworks.com/*"},function(tab) {
          var tab = tab[0];
          console.log(tab.id);
          chrome.tabs.remove(tab.id, function() { });
        });
      }
      if(request.login == true){
        console.log("logging in");
        login();
      }
      if(request.logout == true){
        console.log("logging out");
        logout();
      }
  });
