Login.php: 	Takes the username and password and logs you in if there is an existing
		        account in the Users table

AddContact.php: Takes the contact information parameters (Name, Phone, email, City,
                State, ZIP, Country, UserID ) and inserts them into the Contacts table.
                *Is important that they are inserted with a userID identifying who
                they belong to. If a contact is already on the database under a current
                user, an error message is returned.

SearchContact.php:  Takes the contact name and userID and Selects from database
                    if there is a contact in the Contact table

Register.php:       Creates a new user in the database to allow for login. Inserts
                    Login name, password, first name and lastname into the Users
                    table

Delete.php:         Deletes a contact from the Users table given a UserID and Contact ID

EditContact:    Very similar to AddContact.php but instead of using INSERT statement
                use an UPDATE statement.
