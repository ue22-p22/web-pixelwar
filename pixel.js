const PIXEL_URL = "http://pixels-war.oie-lab.net/"

document.addEventListener("DOMContentLoaded", () => {
    WIDTH = null

    init()

    function init () {
        fetch(PIXEL_URL+"getmap/")
            .then((response) => response.json())
            .then((json) => {
                const id = json.id
                console.log(`my id is ${id}`)
                pixels = json.data
                const height = pixels.length
                WIDTH = pixels[0].length
                const grid = document.getElementById('grid')
                //TODO: maintenant que j'ai le JSON, afficher la grille, et récupérer l'id
                for (const [i, row] of pixels.entries())
                    for (const [j, pixel] of row.entries()) {
                        let div = document.createElement('div')
                        let [r, g, b] = pixel
                        div.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
                        div.addEventListener('click', async (event) => {
                            if (event.shiftKey) {
                                pickColorFrom(div)
                            } else {
                                await paintServerPixel(id, i, j)
                                refresh(id)
                            }
                        })
                        grid.appendChild(div)
                    }

                document.getElementById("refresh").addEventListener('click', () => refresh(id))
                window.setInterval( () => refresh(id), 2000)
            })
    }

    const paintServerPixel = async (id, i, j) => {
        const [r, g, b] = getPickedColorInRGB()
        const url = `${PIXEL_URL}set/${id}/${i}/${j}/${r}/${g}/${b}`
        const message = `${i}x${j} into ${r}/${g}/${b}`
        fetch(url)
            .then(() => console.log(`done painting ${message}`))
            .catch(() => console.log(`could not set ${message}`))
    }

    const paintLocalPixel = (i, j, r, g, b) => {
        const div = document.getElementById("grid").children[i*WIDTH+j]
        // console.log('setting color=', r, g, b, 'on', div)
        div.style.backgroundColor = `rgb(${r}, ${g}, ${b})`
    }

    // A compléter puis à attacher au bouton refresh en passant mon id une fois récupéré
    async function refresh(id) {
        const response = await fetch(PIXEL_URL+"getmap?id="+id)
        const json = await response.json()
        // console.log('deltas', json)
        const deltas = json.deltas
        if (deltas.length)
            console.log(`refreshing ${deltas.length} pixels`)
        for (const [i, j, r, g, b] of deltas)
            paintLocalPixel(i, j, r, g, b)
    }

    //Petite fonction facilitatrice pour récupérer la couleur cliquée en RGB
    function getPickedColorInRGB() {
        let colorHexa = document.getElementById("colorpicker").value

        let r = parseInt(colorHexa.substring(1,3),16);
        let g = parseInt(colorHexa.substring(3,5),16);
        let b = parseInt(colorHexa.substring(5,7),16);

        return [r, g, b];
    }

    function pickColorFrom(div) {
        // we're going to set the 'value' property' of the picker
        // but it expects a #123456 format
        const colorpicker = document.getElementById("colorpicker")

        // this returns a rgb(12, 23, 34)
        const clickedRgb = window.getComputedStyle(div).backgroundColor
        // extract the 3 colors as decimal strings
        // https://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
        const colors = clickedRgb.match(/\d+/g)
        // convert into 2-digits hexa
        // https://stackoverflow.com/questions/17204335/convert-decimal-to-hex-missing-padded-0
        const tohex = (color) => Number(color).toString(16).padStart(2, '0')
        const hexas = colors.map(tohex)
        const newvalue = `#${hexas[0]}${hexas[1]}${hexas[2]}`
        console.log(newvalue)
        colorpicker.value = newvalue
    }
})
