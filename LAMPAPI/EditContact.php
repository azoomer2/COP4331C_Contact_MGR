<?php

	$inData = getRequestInfo();
	$ID = $inData["ID"];
	$Name = $inData["Name"];
	$Phone = $inData["Phone"];
	$email = $inData["email"];
  	$Street = $inData["Street"];
	$City = $inData["City"];
	$State = $inData["State"];
	$ZIP = $inData["ZIP"];
	$Country = $inData["Country"];
 	$office = $inData["office"];

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		// update contact with given user input
		$stmt = $conn->prepare("UPDATE Contacts SET
			Name = '$Name',
			Phone = '$Phone',
			email = '$email',
			Street = '$Street',
			City = '$City',
			State = '$State',
			ZIP = '$ZIP',
			Country = '$Country',
			office = '$office'
			WHERE(ID = '$ID')");
		$stmt->execute();

		if($conn->affected_rows > 0)
		{
			echo "Contact edited successfully";
		}
		else
		{
			echo "Contact was unable to be edited";
		}

		$stmt->close();
		$conn->close();

	}

	function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

 ?>
