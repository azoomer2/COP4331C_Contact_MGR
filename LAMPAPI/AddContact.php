<?php
	$inData = getRequestInfo();

	$Name = $inData["Name"];
	$Phone = $inData["Phone"];
	$email = $inData["email"];
  $Street = $inData["Street"];
	$City = $inData["City"];
	$State = $inData["State"];
	$ZIP = $inData["ZIP"];
	$Country = $inData["Country"];
 	$office = $inData["office"];
	$UserID = $inData["UserID"];

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		# Check if contact is already on the database
		$stmt = $conn->prepare("SELECT Name FROM Contacts WHERE(Phone=? OR email=?) AND (UserID=?)");
		$stmt->bind_param("isi", $Phone,$email, $UserID);
		$stmt->execute();
		$result = $stmt->get_result();

		# If contact already exists
		if( $row = $result->fetch_assoc()  )
		{
			returnWithError("Contact already exists with given phone number or email");
		}
		# Insert contact
		else
		{
		$stmt = $conn->prepare("INSERT into Contacts (Name, Phone, email, Street, City, State, ZIP, Country, office, UserID) VALUES(?,?,?,?,?,?,?,?,?,?)");
		$stmt->bind_param("ssssssissi", $Name, $Phone, $email, $Street, $City, $State, $ZIP, $Country, $office, $UserID);
		$stmt->execute();
		$stmt->close();
		$conn->close();
		returnWithError("");
		}
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>
