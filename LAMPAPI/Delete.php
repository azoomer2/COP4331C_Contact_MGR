<?php

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}

	else
	{
		$ID = $_POST['ID'];
		$conn->query("DELETE FROM Contacts WHERE ID = '$ID'");

		if($conn->affected_rows > 0)
		{
			echo "Contact deleted";
		}
		else
		{
			echo "Contact unable to be deleted";
		}

		$conn->close();
	}

  function returnWithError( $err )
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

?>
