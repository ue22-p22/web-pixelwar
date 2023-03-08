const PIXEL_URL = "http://pixels-war.oie-lab.net/"

document.addEventListener("DOMContentLoaded", async () => {
    let id = await loadGrid();
    document.getElementById("refresh").addEventListener("click", () => {
        refresh(id);
    })
})

async function loadGrid() {
    let pixelsResponse = await fetch(PIXEL_URL+"getmap/");
    let pixels = await pixelsResponse.json();
    let id = pixels.id;
    let nx = pixels.nx;
    let ny = pixels.ny;
    let data = pixels.data;
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            pixel = document.createElement("div");
            pixel.id = `${i}-${j}`;
            pixel.addEventListener("click", () => colorPixel(id, i, j));
            pixel.style.background = `rgb(${data[i][j][0]},${data[i][j][1]},${data[i][j][2]})`;
            document.getElementById("grid").appendChild(pixel);
        }
    }
    return id;
}

function colorPixel(id, x, y) {
    let colorHexa = document.getElementById("colorpicker").value

    let r = parseInt(colorHexa.substring(1,3),16);
    let g = parseInt(colorHexa.substring(3,5),16);
    let b = parseInt(colorHexa.substring(5,7),16);

    let url = PIXEL_URL+`set/${id}/${x}/${y}/${r}/${g}/${b}`;
    
    fetch(url)
        .then(() => refresh(id));
}

async function refresh(id) {
    let pixelsResponse = await fetch(PIXEL_URL+"getmap?id="+id);
    let pixels = await pixelsResponse.json();
    let deltas = pixels.deltas;
    for (delta of deltas) {
        pixel = document.getElementById(`${delta[0]}-${delta[1]}`);
        pixel.style.background = `rgb(${delta[2]},${delta[3]},${delta[4]})`;
    }
}
