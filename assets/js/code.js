const urlBase = 'LAMPAPI';
const extension = 'php';

var userId = 0;
let firstName = "";
let lastName = "";
var blankContact;
var defaultContact;

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
				console.log("jsonObject: ", jsonObject, "\nuserID:", userId);
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

// sends API call with required JSON.
// input: correct JSON structure.
// returns: the POST results.
function editContact(jsonPayload)
{
	let retval = {"error":"","success":""};
	let url = urlBase + '/AddContact.' + extension;
	jsonPayload["ID"] = jsonPayload["contactID"]
	jsonPayload = JSON.parse(jsonPayload);

	console.log("editContact, jsonPayload:", jsonPayload);
	let xhr = new XMLHttpRequest();
	try
	{
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
	}
	catch(err)
	{
		console.log("putting something in error:", err.message);
		retval["error"] = err.message;
		return retval;
	}
	try
	{
		xhr.onreadystatechange = function()
		{
			if (this.readyState == 4 && this.status == 200)
			{
				console.log("success!");
				retval["success"] = "Contact has been edited";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err)
	{
		console.log("putting something in error:", err.message);
		retval["error"] = err.message;
		return retval;
	}

	console.log("successful retval:", retval);
	return retval;
}

if (window.location.href.includes("contacts.html"))
{
	$(document).ready(function(){
		readCookie();
		blankContact = $($("#blankContact").html());
		defaultContact = $($("#defaultContact").html());
		console.log(blankContact);

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
			// stuff to prune later :)
			tmp["UserID"] = userId; // for addContact
			tmp["contactID"] = cRow.attr("contactID"); // for editContact

			let res = JSON.stringify( tmp ); // should be JSON.stringify() before sending off
			console.log("grabJSON() -- grabbed", res);
			return res;
		}

		var cid = 2; // temporary contact unique id maker (not to be used in API)
		function getUniqueContactID()
		{
			cid = cid + 1;
			return cid;
		}

		// function for populating contact JSON given a JSON thing.
		// input: expects a jQuery object of a .contactRow <div> and a JSON object.
		function putJSON(cRow, json)
		{
			console.log("putJSON -- putting", json);
			console.log("into", cRow);
			cRow.find(".nameInput").val(json["Name"]);
			cRow.find("input.phoneInput").val(json["Phone"]);
			cRow.find(".emailInput").val(json["email"]);
			cRow.find("input.streetInput").val(json["Street"]);
			cRow.find("input.cityInput").val(json["City"]);
			cRow.find("select.stateInput").val(json["State"]).change();
			cRow.find("input.zipInput").val(parseInt(json["ZIP"]));
			cRow.find("select.countryInput").val(json["Country"]).change();
			cRow.find(".officeInput").val(json["office"]);
			if (cRow.attr("idInitialized") == "false")
			{
				let tmp = json["contactID"];
				let tID = "C" + tmp;
				console.log("concatenated ID:", tID);
				cRow.attr("contactID", tmp);
				cRow.find("button[data-bs-target='#C1']").attr("data-bs-target", "#"+tID);
				cRow.find("div#C1").attr('id', tID);
				console.log("new collapse ID:", cRow.find("#"+tID).attr('id'), tmp);
				console.log("id find results:", cRow.find("#"+tID));
				cRow.attr("idInitialized", "true");
			}
			console.log("putJSON cRow:", cRow);
		}

		// takes a cRow and hides the buttons unneeded in its current state.
		// meant for page startup.
		function prepareCRow(cRow)
		{
			console.log("prepareCRow -- doing this guy:", cRow);
			// cRow look preparation
			if ($(cRow).attr("editable") == 1)
			{
				console.log("hiding editInfoGroup");
				$(cRow).find(".editInfoGroup:first").hide();
			}
			else
			{
				console.log("hiding saveCancelGroup:", $(cRow).find(".saveCancelGroup:first"));
				$(cRow).find(".saveCancelGroup:first").hide();
			}

			// more/less info handler
			$(cRow).find(".contactInfoButton:first").click(function () {
				console.log("more/less info");
				var $el = $(this);
				$el.children("label").text($el.children("label").text() == "More Info" ? "Less Info": "More Info");
			});

			// edit button handler
			$(cRow).find(".contactEditButton:first").click(function () {
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
				cRow.find(".editInfoGroup:first").hide();
				cRow.find(".saveCancelGroup:first").show();
			});

			// save button handler
			$(cRow).find(".saveButton:first").click(function () {
				let cRow = $(this).parentsUntil("div .contactRow").parent();
				// first, make sure they're saving this contact with a name
				if (cRow.find("input.nameInput").val() == "")
				{
					alert("ERROR: Contacts need a name.");
					return;
				}
				console.log("saving progress");
				// toggle edits
				toggleContactEdits(cRow);

				// editContact() API call
				let res = editContact(grabJSON(cRow));
				if (res["error"] != "")
				{
					// TODO: finish this lol
					console.log("editContact ERROR:", res["error"]);
					toggleContactEdits(cRow); // turn edits back on
				}
				else if (res["success"] != "")
				{
					// TODO: finish this lol
					console.log("editContact SUCCESS:", res["success"]);

					// swap edit/info buttons with save/cancel buttons
					cRow.find(".saveCancelGroup:first").hide();
					cRow.find(".editInfoGroup:first").show();

					// discard oldState
					$(cRow).removeData('oldState');
				}
			});

			// cancel button handler
			$(cRow).find(".cancelButton:first").click(function () {
				let cRow = $(this).parentsUntil("div .contactRow").parent();
				console.log("cancelling edits for", cRow);
				// toggle editability
				toggleContactEdits(cRow);
				// return to previous state
				let putBack = JSON.parse(cRow.data('oldState'));
				console.log("cancel button confirm -- sends to", putBack);
				try {
					putJSON(cRow, putBack);
					// swap button groups
					cRow.find(".saveCancelGroup:first").hide();
					cRow.find(".editInfoGroup:first").show();
				} catch (e) {
					console.log("cancel button ERROR:");
					console.log(e);
				}
			});
		}

		// toggles editable attribute & makes contact editable.
		// input: expects a jQuery object of a .contactRow <div>.
		function toggleContactEdits(cRow)
		{
			//console.log(cRow);
			if (cRow.attr("editable") == 0) {
				cRow.attr("editable", 1);
				// make inputs all editable
				cRow.find("input").prop("readonly", false);
				cRow.find("select").prop("disabled", false);
			}
			else {
				cRow.attr("editable", 0);
				// disable all input boxes
				cRow.find("input").prop("readonly", true);
				cRow.find("select").prop("disabled", true);
			}
		}

		function searchContact()
		{
			let srch = document.getElementById("searchText").value;
			document.getElementById("contactSearchResult").innerHTML = "";

			let contactList = "";

			let tmp = {"search":srch,"UserID":userId};
			let jsonPayload = JSON.stringify( tmp );

			let url = urlBase + '/SearchContact.' + extension;
			console.log("jsonPayload:", jsonPayload);
			console.log("url:", url);
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
						console.log("jsonObject:", jsonObject);

						for( let i=0; i<jsonObject.results.length; i++ )
						{
							// make new cRow
							let tempContact = defaultContact.clone();
							// fill with info
							jsonObject.results[i]["contactID"] = jsonObject.results[i]["ID"];
							console.log(jsonObject.results[i]);
							tempContact.attr("idInitialized", "false");
							putJSON(tempContact, jsonObject.results[i]);
							// finish functionality and prepend to contactsPane
							prepareCRow(tempContact);
							tempContact.prependTo($('#contactsPane div:first'));
						}

						//document.getElementsByTagName("p")[0].innerHTML = contactList;
					}
					else {
						document.getElementById("contactSearchResult").innerHTML = "Something has gone wrong";
					}
				};
				xhr.send(jsonPayload);
			}
			catch(err)
			{
				document.getElementById("contactSearchResult").innerHTML = err.message;
			}

		}

		// add defaultContact rq for testing
		defaultContact.clone().prependTo($('#contactsPane div:first'));
		var inf = $('#contactsPane div:first .contactRow:first').find(".contactInfoButton");
		inf.trigger('click');

		// populate screen with search results
		console.log("searchContact called");
		searchContact();

		// // hide buttongroups not in use
		// $('#contactsPane div:first').children('.contactRow').each(function () {
	  //   prepareCRow(this);
		// });

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



	});
}

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
