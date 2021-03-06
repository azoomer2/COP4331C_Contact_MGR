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
    if ($inData["search"] == "*")
    {
      $stmt = $conn->prepare("SELECT * FROM Contacts where UserID=?");
  		$stmt->bind_param("s", $inData["UserID"]);
  		$stmt->execute();
     
      $result = $stmt->get_result();
    }
    else if ($inData["search"] == "")
    {
      $stmt = $conn->prepare("SELECT * FROM Contacts where UserID=? LIMIT 10");
  		$stmt->bind_param("s", $inData["UserID"]);
  		$stmt->execute();
     
      $result = $stmt->get_result();
    }
    
    else
    {
  		$stmt = $conn->prepare("SELECT * FROM Contacts where Name like ? and UserID=?");
  		$contactName = "%" . $inData["search"] . "%";
  		$stmt->bind_param("ss", $contactName, $inData["UserID"]);
  		$stmt->execute();
  
  		$result = $stmt->get_result();
    }
    
 		while($row = $result->fetch_assoc())
  		{
  			if( $searchCount > 0 )
  			{
  				$searchResults .= ",";
  			}
  			$searchCount++;
  			$searchResults .= '{"Name": "' . $row["Name"]. '", "Phone": "' . $row["Phone"]. '", "email": "' . $row["email"]. '", "Street": "' . $row["Street"]. '", "City": "' . $row["City"]. '", "State": "' . $row["State"]. '", "ZIP": "' . $row["ZIP"]. '", "Country": "' . $row["Country"]. '", "office": "' . $row["office"]. '", "ID": "' . $row["ID"]. '"}';
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
