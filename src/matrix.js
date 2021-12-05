class MatrixSetter {
    #matrix

    constructor(matrix, x, y) {
        this.#matrix = matrix
        this.x = x
        this.y = y
    }

    set set(value) {
        this.#matrix.set(x, y, value)
    }
}

class Matrix {
    #matrix = []

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
        for (let y of this.#matrix) {
            for (let x of y) {
                yield [x, new MatrixSetter(this.#matrix, x, y)]
            }
        }
    }
    
    *lines() {
        for (let y of this.#matrix) {
            for (let x of y) {
                yield [x, new MatrixSetter(this.#matrix, x, y)]
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
        if (value) {this.#matrix[y][x] = value; return this}
        return new MatrixSetter(this.#matrix, x, y)
    }

    map(func) {
        const NewMatrix = new Matrix(this.width, this.height)
        for (const [i, setter] of this) {
            NewMatrix.set(setter.x, setter.y, i)
        }
        for (const [i, setter] of NewMatrix) {
            setter.set = func(i)
        }
        return NewMatrix
    }

    at(x, y) {
        this.#checkBounds(x, y)
        return this.#matrix[y][x]
    }
}

exports.Matrix = Matrix