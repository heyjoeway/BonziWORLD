[logo]: ./img/readme/logo.png
![BonziWORLD logo. I may have taken "inspiration" from WinXP.][logo]

# BonziWORLD

###### Leading the industry in gorilla-based chat clients.

## What the hell is this?

BonziWORLD is a node.js and socket.io based chat client featuring everyone's most ~~hated~~ loved purple gorilla. The client also uses espeak.js to provide text-to-speech voices. Not exactly the original BonziBUDDY voice, but hey, it works.

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
* A max of 15 people are allowed in a public lobby. After that, a new public room will be created. A max of 30 people are allowed in private lobbies.

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
* espeak.js
* seedrandom
* realfavicongenerator.net
* Apache Cordova
* Crosswalk
* scss/sass

You guys are awesome. (And so are you, whoever's reading this!) There are also probably some others I forgot. If I remember you, I'll add you here.

[shoutout1_url]: https://www.youtube.com/channel/UCpIJWYK1BB8LRA5eMZpQX-Q
## The Meme Crew

* "those three shits who came on my app at 2 in the morning"
* [FoenixGamer][shoutout1_url]

If you want to be listed here just email me and I'll probably put you in the next version.

## Contact me

### bonziworldguy@gmail.com

Email me there with any comments, questions, or concerns. Or whatever else. Memes? Sure, throw those in too.

## App Banners

[pc_banner]: ./img/app/desktop.png
![Open on PC for the best experience. (bonziworld.com)][pc_banner]

[chrome_banner]: ./img/app/chrome.png
[chrome_url]: https://chrome.google.com/webstore/detail/bonziworld/naiglhkfakaaialhnjabkpaiihglgnmk
[![Available in the Chrome Web Store.][chrome_banner]][chrome_url]

[gplay_banner]: ./img/app/google-play-badge.png
[gplay_url]: https://play.google.com/store/apps/details?id=com.jojudge.bonziworld
[![Get it on Google Play.][gplay_banner]][gplay_url]

Google Play and the Google Play logo are trademarks of Google Inc.