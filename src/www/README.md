[logo]: ./img/readme/logo.png
![BonziWORLD logo. I may have taken "inspiration" from WinXP.][logo]

# BonziWORLD

###### Leading the industry in gorilla-based chat clients.

## What the hell is this?

BonziWORLD is a node.js and socket.io based chat client featuring everyone's most ~~hated~~ loved purple gorilla. The client also uses speak.js to provide text-to-speech voices. Not exactly the original BonziBUDDY voice, but hey, it works.

## Why did you make this? Why WOULD you make this?

Memes. Also because I'd already finished the BonziBUDDY portion of this project like a year in advance and was trying to find some way to put it to use.

## How do I use it?

1. Enter a nickname (under 25 characters). If you don't enter one, you'll be named "Anonymous". (we r legion du nut 4 get)
2. Optionally, enter a room ID. If you want to join someone else, their room ID will be in the bottom-right corner of the screen.
	* If you enter a room ID that doesn't exist, you will be placed in a private room which can only be joined by people you share the ID with.
3. Be a BonziBUDDY.

## What are the chat commands?

If you see any brackets, they indicate a placeholder. Don't type them in.

* `/name [name]` - Change your name.
	* There is a 25 character limit on names.
* `/speed [speed]` - Change your voice's speed.
	* Max value is 275, min value is 125.
* `/pitch [pitch]` - Change your voice's pitch.
	* Max value is 125, min value is 15.
* `/color [color]` - Change your BonziBUDDY's color! The ones available are:
	* red
	* brown
	* green
	* blue
	* purple
	* black
	* pink
	* If you don't type a color, you will be given one at random.
* `/joke` - Tell a horribly written joke.
* `/fact` - Tell a horribly written "fact".
* `/backflip` - Do a backflip.
	* Do '/backflip swag' for extra swag.
* `/youtube [video ID]` - Play a YouTube video.
	* Alternatively, you can simply paste the URL in chat and it will automatically play it.
* `/asshole [name]` - Call someone an asshole.
	* Don't ask why I implemented this. There's no answer.
	* You can also right click on people to do the same thing.
	* If you ever see a person named "fuG", make sure to call them an asshole.
* `/owo [name]` - owo, wat dis?
	* kill me
	* Works pretty much the same as /asshole, right click and all.
* `/triggered` - The best copypasta.
* `/linux` - I'd just like to interject for a moment.
* `/pawn` - Hi, my name is BonziBUDDY, and this is my website.
* [`/bees`](http://bees.bonziworld.com/) - According to all known laws of aviation, there is no way a bee should be able to fly.
* `/vaporwave` - ＡＥＳＴＨＥＴＩＣ
* `/unvaporwave` - ＡＥＳＴＨＥＴＩＣ ＩＳ ＫＩＬＬ

## Are there any rules?

Obviously no illegal shit. On top of that, there are a few limitations:

* All strings are sanitized to get rid of any malicious HTML/JS/CSS. _Don't even try it motherfucker._
* There is a 2500 character limit in public rooms and a 5000 limit in private rooms.
	* Yes, the Navy Seals copypasta fits.
* There is a 25 character limit on names.
* A max of 8 people are allowed in a public lobby. After that, a new public room will be created. A max of 30 people are allowed in private lobbies.
	* (Yeah, I know I changed the limit down from 15. With the limited screen space and processing power on mobile, this was part of the reason things were running so shitty.)

Remember that people can play YouTube videos whenever they want. **Keep your volume down, headphone users.** Chat rooms are for the most part unmoderated. If shit starts getting spambotty, I might start using my banhammer.

## Shoutouts to

* ~~Simpleflips~~
* Node.JS
* socket.io
* sanitize-html
* Grunt
* Winston ~~(hi there)~~
* Express
* Create.js (Easel.js && Preload.js)
* jQuery
* jquery-contextmenu
* speak.js
* seedrandom
* realfavicongenerator.net
* Apache Cordova
* ~~Crosswalk~~ RIP CROSSWALK v1.?.? - v1.4.2
* scss/sass

You guys are awesome. (And so are you, whoever's reading this!) There are also probably some others I forgot. If I remember you, I'll add you here.