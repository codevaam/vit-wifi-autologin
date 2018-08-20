
try {
  var credential_form = document.getElementsByTagName('form')[0];
  chrome.storage.sync.get(null, function(obj){
    credential_form.elements['userId'].value = obj.username;
    credential_form.elements['password'].value = obj.password;
    credential_form.submit();
  });
} catch (e) {
  console.log("Error Fetching Form: ",e);
}

try {
  
  var mesg1 = new RegExp('Sorry, please check', i)
  var mesg2 = new RegExp('try again',i)
  var err2 = document.getElementsByName('dynamicMacAuth')[0];
  var responseText = document.getElementsByTagName('html')[0].innerHTML;
  var incorrect_cred = mesg1.test(responseText) || mesg2.test(responseText) || err2;
  console.log(document.getElementsByTagName('html')[0].innerHTML);
  console.log(incorrect_cred);
  if(incorrect_cred){
    console.log("Incorrect credentials")
    alert("Incorrect credentials");
    chrome.runtime.sendMessage({error : true});  
  }
}
catch (e) {
  console.log(e);
}
