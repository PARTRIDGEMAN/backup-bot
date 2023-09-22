import 'dotenv/config'
import env from 'env-var'
import ms from 'ms'

/* Notice:
To configure the variables for the bot, you will need to create a file named '.env' within the project directory and define the variables within. 
Here is an example of the expected format for the contents of the '.env' file:

DISCORD_TOKEN=your-token-here

Make sure to replace 'your-token-here' with the actual token for your Discord bot.
*/

export default {
	token: env.get('DISCORD_TOKEN').required().asString(),
	frequency: ms('3 hours'), // how often the bot makes a server backup
	owners: ['OwnerID1', 'OwnerID2'], //you can add as many owners as you want
	database: {
		host: 'Redis IP', //redis IP
		port: 6379, //redis port default 6379 (change to your port)
		password: 'Password' //Redis Password
	}
}
