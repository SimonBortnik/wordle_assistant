#!/usr/bin/env node

import inquirer from 'inquirer'
import getWordList from './dbLookup.js'
import frequency from './letterFrequency.js'
import chalk from 'chalk'

let containedChars = new Map()
let excludedChars = []
let excludedWords = []
let confirmedPositions
let length
let currentGuess

let playing = true

async function startCLI() {
    length = await getLength()
    confirmedPositions = Array(length)

    while(playing){
        await getInput()
        await getFeedback()
    }
}

// Get length from user input
async function getLength() {
    while (true) {
        const answer = await inquirer.prompt({
            name: 'length',
            type: 'input',
            message: 'How long is today\'s word?'
        })
        if(answer.length && answer.length > 0) {
            return parseInt(answer.length)
        }
        console.log('This seems not to be a valid input, please try again')
    }   
}

// Get user input. The options are: 1) take the suggested word, 2) get a new suggestion 3) input own word
async function getInput() {
    let inputing = true
    
    while (inputing) {
        currentGuess = pickWord(await getWordList(length, containedChars, excludedChars, excludedWords, confirmedPositions))
        console.log('Hmmm what about:', currentGuess)

        const choice = await inquirer.prompt({
            name: 'input',
            type: 'list',
            message: 'Did you use that word?',
            choices: [{name: 'Yes', value: 'y'}, {name: 'It doesn\'t exists, give me another one', value: 'n'},
                {name: 'No, I have my own word', value: 'o'}, {name: 'Yes, and I won 🎆', value: 'w'}],
        })
        
        switch (choice.input) {
            case 'y':
                return
            case 'n':
                excludedWords.push(currentGuess)
                console.log(excludedWords)
                break
            case 'o':
                const answer = await inquirer.prompt({
                    name: 'input',
                    type: 'input',
                    message: 'What did you input?',
                    default: rec
                })
                currentGuess = answer.input.toLowerCase()
                inputing = false
                break
            case 'w':
                console.log('Winner winner chicken dinner')
                process.exit()
        }
    }
}

// Get the game's feedback to the word
async function getFeedback() {
    const answer = await inquirer.prompt({
        name: 'feedback',
        type: 'input',
        message: 'Which character was marked with which color? Answer with y/g/b. E.g: ' + chalk.green('g') + chalk.yellow('a') + chalk.black('l') + 
            ' --> gyb',
    })
    if(!(answer.feedback.includes('y') || answer.feedback.includes('b') )) {
        playing = false
        console.log('Winner winner chicken dinner')
        return
    }
    let fbArr = answer.feedback.split('')
        fbArr.forEach((fb, i) => {
        let currentChar = currentGuess.charAt(i)
        switch (fb) {
            case 'g':
                confirmedPositions[i] = currentChar
                break
            case 'y':
                if(containedChars.has(currentChar)){
                    containedChars.get(currentChar)[i] = false
                } else {
                    containedChars.set(currentChar, [true, true, true, true, true])
                    containedChars.get(currentChar)[i] = false
                }
                break
            case 'b':
                // If currentChar was already marked as green and now is marked as black, it means there are no more instances of it in the word
                if(confirmedPositions.includes(currentChar)){
                    confirmedPositions.forEach((char, i) => {
                        if(char !== currentChar){
                            containedChars.get(currentChar)[i] = false
                        }
                    })
                } else{
                    excludedChars.push(currentChar)
                }
                break
        }
    })

    // Display information about the current run
    console.log(chalk.red('Excluded characters: ' + excludedChars))
    visualizeContained()
    visualizeConfirmed()
}

// Picks the word that adds the most valuable clues from an array of possible matching words. Whether the algorythm is optimal is open to discussion (prob. not)
function pickWord(words) {
    let addedValue = 0
    let currentWinner

    // The added value of clues that each word provides is quantified
    words.forEach(word => {
        let wordValue = 0
        let alreadyUsed = []
        word.split('').forEach(char => {
            // Characters that weren't part of any guess are prioritized over characters that appear more than once 
            // Getting information about additional included or excluded characters is deemed more useful than knowing if a character is contained twice
            // Also, only the general occurence of a character in the language is considered for its value. The value is not weighted with the character's 
            // position in the word
            if(addingValue(char) && !alreadyUsed.includes(char)){
                wordValue += frequency.get(char)
                alreadyUsed.push(char)
            }
        })

        // The 'best' guess is saved
        if(addedValue < wordValue){
            addedValue = wordValue
            currentWinner = word
        }
    })
    return currentWinner
}

// Checks whether a character was already part of a guess
function addingValue(char) {
    return !containedChars.has(char)
}

// Visualizes information about 'yellow' characters
function visualizeContained() {
    console.log(chalk.yellow('Contained characters and their possible positions:'))
    containedChars.forEach((v,k) => {
        let output = chalk.yellow(`    ${k}: `)
        v.forEach(val => {
            if(val){
                output += chalk.yellow('_')
            }else{
                output += chalk.red('X')
            }
        })
        console.log(output)
    })
}

// Visualizes information about 'green' characters
function visualizeConfirmed(){
    let output = chalk.green('Currently confirmed characters: ')
    for (let i = 0; i < length; i++) {
        if(confirmedPositions[i]){
            output += chalk.green(confirmedPositions[i])
        } else {
            output += chalk.yellow('_')
        }
    }
    console.log(output)
}
await startCLI()