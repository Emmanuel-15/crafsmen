# Crafsmen

a [Sails v1](https://sailsjs.com) application

# Author

Sarvesh Padwalkar

# Note

Make sure u established a secure database connection.
following are the constraints mandatory for proper functioning of the application

+ table_foriegn_keys{

	services{
		serviceType_serviceTypeId_fkey
	},
	
	servicePrice{
		contractors_contractorId_fkey
		services_serviceId_fkey
	},
	
	contractorServices{
		contractors_contractorId_fkey
		services_serviceId_fkey
	},
	
	bookings{
		contractors_contractorId_fkey
		servicePrice_servicePriceId_fkey
		service_serviceId_fkey
		userLogin_userId_fkey
	}
}
+ trigger {
	BEGIN
		DELETE FROM temp
		WHERE created_date < NOW() - INTERVAL '1 minute';
		
		IF EXISTS (SELECT * FROM temp WHERE email_or_phone = new.email_or_phone) THEN
			-- Delete the existing record
			DELETE FROM temp WHERE email_or_phone = new.email_or_phone;
		END IF;
	  RETURN NEW;
	END;
}
+ 1 admin must exist in this system

### Links

+ [Sails framework documentation](https://sailsjs.com/get-started)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)


### Version info

This app was originally generated on Sun Dec 17 2022 13:23:02 GMT+0530 (India Standard Time) using Sails v1.5.2.

<!-- Internally, Sails used [`sails-generate@2.0.6`](https://github.com/balderdashy/sails-generate/tree/v2.0.6/lib/core-generators/new). -->



<!--
Note:  Generators are usually run using the globally-installed `sails` CLI (command-line interface).  This CLI version is _environment-specific_ rather than app-specific, thus over time, as a project's dependencies are upgraded or the project is worked on by different developers on different computers using different versions of Node.js, the Sails dependency in its package.json file may differ from the globally-installed Sails CLI release it was originally generated with.  (Be sure to always check out the relevant [upgrading guides](https://sailsjs.com/upgrading) before upgrading the version of Sails used by your app.  If you're stuck, [get help here](https://sailsjs.com/support).)
-->

### help

following command is used to describe table schema in pgadmin.
<!-- SELECT column_name, data_type, character_maximum_length, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'userlogin'; -->