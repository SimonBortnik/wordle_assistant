import {Sequelize, DataTypes} from 'sequelize'

// Yes sequelize is not neccessary for this program but I like how it initializes everything and it makes changing the database easy 
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './Dictionary.db',
    logging: false
  })

// Create the query string
function createQueryString(length, confirmedChars, excludedChars, excludedWords, confirmedPositions) {
    let baseSring = `SELECT DISTINCT word FROM entries e where length(e.word) = ${length}`

    // Adds the confirmed characters to the query
    confirmedChars.forEach((possiblePositions, character) => {
        baseSring += ` AND lower(e.word) like '%${character}%'`
        possiblePositions.forEach((val, i) => {
            // Exclude words with character in a position that was already tested
            if(!val){
                // For some (probably very good) reason unbeknownst to me SQL starts counting at 1 instead of zero
                baseSring += ` AND NOT instr(lower(e.word), '${character}') = ${i + 1}`
            }
        })
    })
    
    // Exclude words containing an excluded character
    excludedChars.forEach(char => {
        baseSring += ` AND e.word NOT like '%${char}%'`
    })
    
    // Exclude words that are not in the game's dictionary
    excludedWords.forEach(word => {
        baseSring += ` AND lower(e.word) NOT like '${word}'`
    })

    // Include only words with confirmed characters in confirmed positions. This is needed because the same letter could be used twice
    // so just setting all but one 'possiblePostion' entries to false as soon as a char is marked green
    // could lead to the right word never being found
    confirmedPositions.forEach((char, i) => {
        baseSring += ` AND instr(lower(e.word), '${char}') = ${i + 1}`
    })
    return baseSring
}

// Queries the database for a list of matches
async function getWordList(length, confirmedChars, excludedChars, excludedWords, confirmedPositions) {
    // Yes using unsanitized user input in querries is bad, but since the database is available to the general public I think it's ok
    const [rawResults, metadata] = await sequelize.query(createQueryString(length, confirmedChars, excludedChars, excludedWords, confirmedPositions))
    let words = []
    rawResults.forEach(result => {
        words.push(result.word.toLowerCase())
    })
    return words
}

export default getWordList