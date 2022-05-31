<?php

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}

	else
	{
		$id = $_POST['id'];
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = '$id'");
		$stmt->execute();
		$result = $stmt->get_result();

		if($result)
		{
			echo "Contact deleted";
		}
		else
		{
			returnWithError("Contact unable to be deleted");
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
