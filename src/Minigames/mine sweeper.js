const { RequiredArg, Command } = require("./../commands.js")
const { Game, MPGame } = require("./../minigames.js")

class MineSweeperCell {
    constructor(isbomb) {
        this.isbomb = isbomb
        this.isrevealed = false
        this.nearbybombs = 0
    }

    setNearbyCells
}

class MineSweeperGame {
    constructor() {
        this.board = []
        for (let y = 0; y < 9; y++) {
            this.board[y] = []
            for (let x = 0; x < 9; x++) {
                this.board[y][x] = MineSweeper.uncheckedTile
            }
        }
    }
}

MineSweeper = new Game(() => {
    return new MineSweeperGame()
})
MineSweeper.uncheckedTile = 1
MineSweeper.checkedTile = 2
MineSweeper.bombTile = 3
MineSweeper.help =
    "`&crew examine (color)` to examine a crewmate, the impostor might find you though...\n" +
    "`&crew eject (color)` to eject a crewmate out, you can only eject once"