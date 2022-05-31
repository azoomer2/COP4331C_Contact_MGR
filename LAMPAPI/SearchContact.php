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
		$stmt = $conn->prepare("SELECT Name, Phone, email, City, State, ZIP, Country, UserID FROM Contacts WHERE (Name=? OR Phone=? OR PhoneNumber=? OR email=? OR City=? OR State=? OR ZIP=? OR Country=?) AND (UserID=?)");
		$stmt->bind_param("sssssisi", $Name, $Phone, $email, $City, $State, $ZIP, $Country, $UserID);

		$stmt->execute();
		$result = $stmt->get_result();

		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{' . '"Name": ' . '"' . $row["Name"] . '",';
			$searchResults .= '"Phone": ' . '"' . $row["Phone"] . '",';
			$searchResults .= '"email": ' . '"' . $row["email"] . '",';
			$searchResults .= '"City": ' . '"' . $row["City"] . '",';
			$searchResults .= '"State": ' . $row["State"] . '}';
			$searchResults .= '"ZIP": ' . $row["ZIP"] . '}';
			$searchResults .= '"Country": ' . $row["Country"] . '}';
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
