# tictactoe-server
Tic tac toe game server - NodeJS with websockets

Created by James Nowecki in NodeJs v12.15.0.

Half way point reflections:

 - Not convinced switch case to handle different payload types is optimal - seems clean to switch on incoming request type, but I think separate closures in multiple if/else statements might be more verbose but reliable.
 - Should've written the winState code in a TDD fashion with JEST rather than manually testing.
 - winstates - Cycling through array of all possible victory conditions and parsing the boardState seems fine for a very simple game like tictactoe but isn't very scalable for games with more complex board states.
 - generateGuid - Though probably infinitesimally small probability, probably exists a chance this func could return an identical ID. Not likely a problem in a small scale app with very few connections, but in much larger applications, the more users there are, the increasing chance this might occur. Could prob pass in a list of all currently active guids and test if the generated one has already been generated. If it has, reject and regenerate.

To run: 

Requires nodejs installed.

Clone down with git, run 'npm install' in root to install dependencies.

Execute command 'npm run start' to start the server.

Players can play in different browser tabs. One player can click the create game button, then join the game, and pass the game ID to other players and they can join it in their own browser tab.

Final Comments:

 - Would definitely reevalute use of the switch cases here in a refactor - If/else probably cleaner with closures and block scoped variables.
 - Task made me have to evaluate and determine where logic should 'live' in the project, particularly for allowing moves to be passed etc. I feel most logic in this design pattern ('Server Authoritative Model') should obviously be determined and controlled by the server. I did put some conditional logic in the front end as well to stop client spamming move requests.
 - Task raised interesting thoughts about how to handle state in node for me, and about recovery in case of server crashes - Game states could probably be easily stored in a DB as JSON (e.g. MongoDB) for backup and recovery, though not sure how I would ID clients in that case, as a new connection would generate new random GUID. I might in this case consider identifying clients based on IP address? Use authentication e.g. something like google SSO.
 - I don't know enough about websockets and WSS:// - This app is not secure.
 - My paradigm here works because the game is turn-based. Real time games would need something different, e.g. 'last req in wins' for updating gamestate, and broadcasting the gamestate payload multiple times a second?
 - This app could probably be modularized in a more sophisticated way.
 - How do I handle the end of the game, and what do I do with the server? I've closed the socket connections to the players on game end, but probably need to clean out the instantiation of the games from the 'games' object maintaining the server state.
 - Next work here would be to get a live version hosted and working so people can actually play across the net.

Refactor comments:

 - Conditional logic on game reset to prevent an accidental game reset. Argument to be made here that players could easily want to reset an UNFINISHED game (particularly a boardgame of a more complex nature) when they are in a position they regard as unwinnable/not worth continuing with, e.g. a resignation. Perhaps this might be better handled in the front end with a button that then has a subsequent 'are you sure you want to reset?' confirmation check?
 - Bug with the sharing of gamestates was caused by a lack of understanding on my part about shallow vs deep equality of objects in javascript. I thought I had created a new reference, whereas instead I had created two references to the same object in memory. Not certain if JSON.parse(JSON.stringify()) is the cleanest way to create a deep copy, but seems to work and eliminate the bug here.
 - Reset func now means that closing the sockets on end of game is unacceptable, so code removed. Not certain architecturally where to put a server controlled close of socket. Connection will close on closure of browser tab, but what if someone sits connected for days on end? Memory leak? Maybe could add a timestamp to each connection and run a function somewhere that closes all open connections after a while, or generate a timestamp of last time they sent a message to server, and clean them out then? Not currently certain how best to run this, as previous implementations I have seen have used chron jobs yml files etc.


Coded to 'With Teeth' (Nine Inch Nails, 2005), 'Twilight' (Boa, 2001), 'The Impossible Kid' (Aesop Rock, 2016), 'Conditions of My Parole' (Puscifer, 2011), 'Koi No Yokan' (Deftones, 2012), 'Eat the Elephant' (A Perfect Circle, 2018).
