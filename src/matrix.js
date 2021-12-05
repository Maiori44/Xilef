class MatrixCell {
    #matrix

    constructor(matrix, x, y) {
        this.#matrix = matrix
        this.x = x
        this.y = y
    }

    get value() {
        return this.#matrix[this.y][this.x]
    }

    set value(value) {
        this.#matrix[this.y][this.x] = value
    }
}

class Matrix {
    #matrix = []

    /**
    * creates a new Matrix
    * @class
    * @param {number} x - the width of the Matrix
    * @param {number} y - the height of the Matrix
    * @param {any} start - default value given to every cell in the Matrix
    */
    constructor(x, y, start) {
        this.width = x
        this.height = y
        for (let cy = 0; cy < y; cy++) {
            this.#matrix[cy] = []
            for (let cx = 0; cx < x; cx++) {
                this.#matrix[cy][cx] = start
            }
        }
    }

    get matrix() {
        return Object.freeze([...this.#matrix].map((row) => Object.freeze([...row])))
    }

    *[Symbol.iterator]() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                yield new MatrixCell(this.#matrix, x, y)
            }
        }
    }
    
    *lines() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                yield [new MatrixCell(this.#matrix, x, y), null]
            }
            yield ["\n", y]
        }
    }

    #checkBounds(x, y) {
        if (x < 0 || x >= this.width) throw new Error(`tried to access out of bounds location (${x}), matrix width is ${this.width}`)
        if (y < 0 || y >= this.height) throw new Error(`tried to access out of bounds location (${y}), matrix height is ${this.height}`)
    }

    checkBounds(x, y) {
        return (this.#matrix[y] && this.#matrix[y][x])
    }

    compare(x, y, check) {
        this.#checkBounds(x, y)
        return this.#matrix[y][x] == check
    }

    set(x, y, value) {
        this.#checkBounds(x, y)
        this.#matrix[y][x] = value
        return this
    }

    map(func) {
        const NewMatrix = new Matrix(this.width, this.height)
        for (const cell of this) {
            NewMatrix.set(cell.x, cell.y, cell.value)
        }
        for (const cell of NewMatrix) {
            cell.value = func(cell)
        }
        return NewMatrix
    }

    at(x, y) {
        this.#checkBounds(x, y)
        return this.#matrix[y][x]
    }

    getCell(x, y) {
        this.#checkBounds(x, y)
        return new MatrixCell(this.#matrix, x, y)
    }

    addRow(start) {
        this.height += 1
        const newRow = new Array(this.width).fill(start)
        this.#matrix.push(newRow)
    }
}

exports.Matrix = Matrix