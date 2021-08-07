const { RequiredArg, Command } = require("./../commands.js")

class v_ {
    constructor(id, bit) {
        this.id = id
        this.value = 2 ** bit - 2 ** (bit - 1)
    }
}

const v_Types = {
    binary: [

    ],
    common: [
        new v_("<:abyssv_common:873259417041268746>", 1),
        new v_("<:concernedv_common:873259417708154880>", 2),
        new v_("<:cringev_common:873259417007718421>", 3),
        new v_("<:cyclopsv_common:873259417418731531>", 4),
        new v_("<:doublev_common:873259417733312613>", 5),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", ),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
    ],
    rare: [
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
    ],
    epic: [
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
    ],
    legendary: [
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
        new v_("", b1),
    ]
}