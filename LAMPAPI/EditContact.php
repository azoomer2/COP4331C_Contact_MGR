<?php

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$ID = $_POST['ID'];

		// get user input for new contact information
		$Name = $_POST['Name'];
		$Phone = $_POST['Phone'];
		$email = $_POST['email'];
		$Street = $_POST['Street'];
		$City = $_POST['City'];
		$State = $_POST['State'];
		$ZIP = $_POST['ZIP'];
		$Country = $_POST['Country'];
		$office = $_POST['office'];

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
			WHERE ID = '$ID'");
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


 ?>
