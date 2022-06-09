<?php
  $inData = getRequestInfo();

	$ID = $inData["ID"];

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}

	else
	{
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE (ID=?)");
		$stmt->bind_param("i", $ID);

    if($stmt->execute() == true)
    {
    	returnWithError("");
    }
    else
    {
    	returnWithError("Contact unable to be deleted");
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
