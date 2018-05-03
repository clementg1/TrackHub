

/**
* Global Variable definitions
**/
var PATHS = {
	landing_page: 'http://localhost:2000/landing_page.html',
	home_page: 'http://localhost:2000/home.html'
}


/************************************************************************************/
/********************************** Window Session **********************************/
// window object
var win = window.top || window;

// session store
var store = (win.name ? JSON.parse(win.name) : {});

// save store on page unload
function Save() {
	win.name = JSON.stringify(store);
};

// page unload event
if (window.addEventListener) window.addEventListener("unload", Save, false);
else if (window.attachEvent) window.attachEvent("onunload", Save);
else window.onunload = Save;

/************************************************************************************/
/**
*Set logged_in variable when a user is logged in
**/
function setLoggedIn(){
	store["logged_in"] = true;
}

/**
*Get logged_in variable
**/
function getLoggedIn(){
	return store["logged_in"];
}

/**
*Reset Logged in variable when user logs out
**/
function resetLoggedIn(){
	store["logged_in"] = false;
}

/**
*Grab value from database to see if user is logged in
**/

/**
*Check if logged_in to know where to redirect to home
**/
function redirectToHome(){
	if (logged_in){
		window.location = PATHS.home_page;
	} else{
		window.location = PATHS.landing_page;
	}
}

function notify(type, msg, time_out, functionCallback){     
    toastr.options = {
      "timeout": time_out
    }
    if (type === "success"){
        toastr.success(msg);
    }
    else if (type === "error"){
      toastr.error(msg);
    }
    else if (type === "warning"){
    	toastr.warning(msg)
    }
    if (functionCallback){
      setTimeout(function(){ functionCallback(); }, time_out);
    }
  }

function checkInputs(inputs){
	var msg = "Don't forget ";
	var changed = false

  for (field_name in inputs){
    var field = inputs[field_name];
    if(field === "" || (field.trim() === "")){
      msg += field_name + ", ";
      changed = true;
    }
  }

  msg = msg.slice(0,-2);
  console.log("Error msg test: " + msg);
	return {"msg": msg, "changed": changed};
}

function passwordRequirementsCheck(password){
  return password;
}