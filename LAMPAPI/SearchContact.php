<?php

	$inData = getRequestInfo();

	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "root", "cop43312", "COP4331");
	if ($conn->connect_error)
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		$stmt = $conn->prepare("SELECT Name from Contacts where Name=? and UserID=?");
		$contactName = "%" . $inData["Name"] . "%";
		$stmt->bind_param("ss", $contactName, $inData["UserID"]);
		$stmt->execute();

		$result = $stmt->get_result();

		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{"Name": "' . $row["Name"] . '", "Phone": "' . $row["Phone"] . '", "email": "' . $row["email"] . '", "City": "' . $row["City"] . '", "State": "' . $row["State"] . '", "ZIP": "' . $row["ZIP"] . '", "Country": "' . $row["Country"] . '", "UserID": "' . $row["UserID"] . '"}';
		}

		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}

		$stmt->close();
		$conn->close();
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
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}

	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}

?>
