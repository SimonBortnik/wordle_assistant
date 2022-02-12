# wordle_assistant
A CLI that helps you solve the daily wordle

## Installation
```shell
$ npm install
$ node app.js
```

## Usage
After running the assistant in the temrinal of your choice follow the instructions on screen to solve the daily wordle in an (almost) optimal way. Then send the result to your friends... I won't tell if you don't ;)

## Shortcomings
The algorythm that detirmines which if the possible words should be used for the next guess takes only into account how often a character is used in the given language, but not how often it is used at the exact position. The reasons for this are: I couldn't find an API that would provide such a position-weighted letter frequency and that I think trying the most used letters first valuable regardless of their position, since it helps narrow down the search for the next guess.

The UI is not the best. The user needs to input the color of the letters by hand like this: gyb (<-- First letter is green, second yellow, third black/gray). A better way would be to give the user a visual cue which character he is inputing. Imagine the word 'gal' was rated with green, green, black and the user already inputed the first letter was green. The interface could present him with: g_l (imagine the g is green)
