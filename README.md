# tictactoe-server
Tic tac toe game server - NodeJS with websockets

Created by James Nowecki in NodJs v12.15.0.

Half way point reflections:

 - Not convinced switch case to handle different payload types is optimal - seems clean to switch on incoming request type, but I think separate closures in multiple if/else statements might be more verbose but reliable.
 - Should've written the winState code in a TDD fashio with JEST rather than manually testing.
 - winstates - Cycling through array of all possible victory conditions and parsing the boardState seems fine for a very simple game like tictactoe but isn't very scalable for games with more complex board states.
 - generateGuid - Though probably infinitesimally small probability, probably exists a chance this func could return an identical ID. Not likely a problem in a small scale app with very few connections, but in much larger applications, the more users there are, the increasing chance this might occur. Could prob pass in a list of all currently active guids and test if the generated one has already been generated. If it has, reject and regenerate.