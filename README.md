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


Coded to 'With Teeth' (Nine Inch Nails, 2005), 'Twilight' (Boa, 2001), 'The Impossible Kid' (Aesop Rock, 2016), 'Conditions of My Parole' (Puscifer, 2011).
