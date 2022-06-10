const urlBase = '143.198.102.67';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";

function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";

	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;
//	var hash = md5( password );

	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login,password:password};
//	var tmp = {login:login,password:hash};
	let jsonPayload = JSON.stringify( tmp );

	//let url = urlBase + '/LAMPAPI/Login.' + extension;
	let url = 'LAMPAPI/Login.' + extension;
	console.log(url);
	let xhr = new XMLHttpRequest();
	try
	{
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				let jsonObject = JSON.parse( xhr.responseText );
				userId = jsonObject.id;
				console.log("userID:", userId);
				if( userId < 1 )
				{
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
				console.log("cookie saved");
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("loginResult").innerHTML = err.message;
	}

}

function saveCookie()
{
	let minutes = 20; // Timer before login expiry.
	let date = new Date();
	date.setTime(date.getTime()+(minutes*60*1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");
	for(var i = 0; i < splits.length; i++)
	{
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");
		if( tokens[0] == "firstName" )
		{
			firstName = tokens[1];
		}
		else if( tokens[0] == "lastName" )
		{
			lastName = tokens[1];
		}
		else if( tokens[0] == "userId" )
		{
			userId = parseInt( tokens[1].trim() );
		}
	}

	if( userId < 0 )
	{
		window.location.href = "index.html";
	}
	else
	{
		document.getElementById("userName").innerHTML = "Logged in as " + firstName + " " + lastName;
	}
}

function doLogout()
{
	console.log("Logging out");
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "index.html";
}

function editContact()
{

}

function searchContact()
{
	let srch = document.getElementById("searchText").value;
	document.getElementById("contactSearchResult").innerHTML = "";

	let contactList = "";

	let tmp = {search:srch,userId:userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	try
	{
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				document.getElementById("contactSearchResult").innerHTML = "Contact(s) has been retrieved";
				let jsonObject = JSON.parse( xhr.responseText );

				for( let i=0; i<jsonObject.results.length; i++ )
				{
					contactList += jsonObject.results[i];
					if( i < jsonObject.results.length - 1 )
					{
						contactList += "<br />\r\n";
					}
				}

				document.getElementsByTagName("p")[0].innerHTML = contactList;
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactSearchResult").innerHTML = err.message;
	}

}

$(document).ready(function(){
	var blankContact = $($("#blankContact").html());
	var defaultContact = $($("#defaultContact").html());
	console.log(blankContact);

	// add defaultContact rq for testing
	defaultContact.clone().prependTo($('#contactsPane div:first'));
	var inf = $('#contactsPane div:first .contactRow:first').find(".contactInfoButton");
	inf.trigger('click');

	// hide buttongroups not in use
	$('#contactsPane div:first').children('.contactRow').each(function () {
    if ($(this).attr("editable") == 1)
		{
			console.log("hiding saveCancelGroup");
			$(this).find(".editInfoGroup:first").hide();
		}
		else
		{
			console.log("hiding saveCancelGroup");
			$(this).find(".saveCancelGroup:first").hide();
		}
});

	// function for grabbing contact JSON with all info addContact and editContact need.
	// input: expects a jQuery object of a .contactRow <div>.
	// returns: a JSON object.
	function grabJSON(cRow)
	{
		// XSS vulnerable.
		let tmp = {};
		tmp["Name"] = cRow.find("input.nameInput").val();
		tmp["Phone"] = cRow.find("input.phoneInput").val();
		tmp["email"] = cRow.find("input.emailInput").val();
		tmp["Street"] = cRow.find("input.streetInput").val();
		tmp["City"] = cRow.find("input.cityInput").val();
		tmp["State"] = cRow.find("select.stateInput option:selected").text();
		tmp["ZIP"] = parseInt(cRow.find("input.zipInput").val());
		tmp["Country"] = cRow.find("select.countryInput option:selected").text();
		tmp["office"] = cRow.find("input.officeInput").val();
		tmp["UserID"] = userId;
	//	var tmp = {login:login,password:hash};
		let res = JSON.stringify( tmp );
		return res;
	}

	// function for populating contact JSON given a JSON thing.
	// input: expects a jQuery object of a .contactRow <div> and a JSON object.
	function putJSON(cRow, json)
	{
		// will be the opposite of grabJSON's code :) 
	}

	// more/less info handler
	$(".contactInfoButton").click(function () {
		console.log("more/less info");
	  var $el = $(this);
	  $el.children("label").text($el.children("label").text() == "More Info" ? "Less Info": "More Info");
	});

	// edit button handler
	$(".contactEditButton").click(function () {
		let cRow = $(this).parentsUntil("div .contactRow").parent();
		console.log("edit time :)");
		let editable = cRow.attr("editable");
		console.log(editable);
		// if window already expanded, keep it expanded
		let infoButtonText = $(this).parent().find(".contactInfoButton label").text();
	  console.log(infoButtonText);
		if (editable == 0 && infoButtonText == "More Info") {
			var inf = $(this).parent().children(".contactInfoButton");
			inf.trigger('click');
		}

		// save current entered info
		$(cRow).data('oldState',grabJSON(cRow));
		console.log("CROW DATA:");
		console.log($(cRow).data('oldState'));

		// now, make contact editable
		toggleContactEdits(cRow);
		// swap edit/info buttons with save/cancel buttons
		cRow.children(".editInfoGroup").hide();
		cRow.children(".saveCancelGroup").show();
	});

	// save button handler
	$(".saveButton").click(function () {
		console.log("saving progress");
		// toggle edits
		// discard oldState
		// editContact();
	});

	// cancel button handler
	$(".cancelButton").click(function () {
		let cRow = $(this).parentsUntil("div .contactRow").parent();
		console.log("cancelling edits");
		// toggle editability
		toggleContactEdits(cRow);
		// return to previous state
		putJSON(cRow, $(cRow).data('oldState'));
		// swap button groups
		cRow.children(".saveCancelGroup").hide();
		cRow.children(".editInfoGroup").show();
	});

	// add/cancel adding contact handling
	$('#addContactButton').click(function () {
		console.log("newContact called");
		blankContact.clone().prependTo($('#contactsPane div:first'));
		$('#contactsPane .contactRow:first').find(".editInfoGroup:first").hide();

		// cancel button
		$('#contactsPane div:first .contactRow:first .cancelButton:first').click(function () {
			console.log("new contact cancelled!");
			$(this).parentsUntil("div .contactRow").parent().remove();
		});
		// save button
		$('#contactsPane div:first .contactRow:first .saveButton:first').click(function () {
			console.log("new contact saved!");
			console.log(grabJSON($(this).parentsUntil("div .contactRow").parent()));
			// $(this).parentsUntil("div .contactRow").parent().remove();
			toggleContactEdits($(this).parentsUntil("div .contactRow").parent());
		});
	})

	// toggles editable attribute & makes contact editable.
	// input: expects a jQuery object of a .contactRow <div>.
	function toggleContactEdits(cRow)
	{
		//console.log(cRow);
		if (cRow.attr("editable") == 0) {
			cRow.attr("editable", 1);
			// make inputs all editable
			cRow.children("input").prop("disabled", false);
		}
		else {
			cRow.attr("editable", 0);
			// disable all input boxes
			cRow.children("input").prop("disabled", true);
		}
	}

});

function addContact()
{
	let newContact = document.getElementById("contactText").value;
	document.getElementById("contactAddResult").innerHTML = "";

	let tmp = {contact:newContact,userId,userId};
	let jsonPayload = JSON.stringify( tmp );

	let url = urlBase + '/AddContact.' + extension;

	let xhr = new XMLHttpRequest();
	try
	{
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				document.getElementById("contactAddResult").innerHTML = "Contact has been added";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		document.getElementById("contactAddResult").innerHTML = err.message;
	}

}

// function newContact()
// {
// 	console.log("newContact called");
// 	$('contactsPane').prepend(blankContact.clone());
// }
//Hey dude
