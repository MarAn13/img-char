const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const img = document.getElementById("img");
img.addEventListener("load", draw, false);
const symbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u',
    'v', 'w', 'x', 'y', 'z'
];
let kernel = 5;
let brightness = 2;
const input = document.getElementById("input");
input.addEventListener("change", file_upload, false);
const reader = new FileReader();
reader.addEventListener("load", function () {
    img.src = reader.result;
}, false);
const input_kernel = document.getElementById("input_kernel");
input_kernel.addEventListener("input", input_val_change, false);
const input_brightness = document.getElementById("input_brightness");
input_brightness.addEventListener("input", input_val_change, false);
const kernel_val = document.getElementById("kernel_val");
const brightness_val = document.getElementById("brightness_val");
kernel_val.textContent = kernel;
brightness_val.textContent = brightness;

function input_val_change() {
    if (this.id === "input_kernel") {
        kernel = parseInt(this.value);
        kernel_val.textContent = this.value;
    } else {
        brightness = parseFloat(this.value);
        brightness_val.textContent = this.value;
    }
    draw();
}

function file_upload() {
    const file = this.files[0];
    reader.readAsDataURL(file);
}

function rgb_to_grayscale(r, g, b) {
    return 0.299 * r + 0.587 * g + 0.114 * b;
}

function gen_int(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function reduce_scale(pixel_arr, kernel) {
    let new_pixel_arr = [];
    let x_step = kernel,
        y_step = kernel;
    let x_step_left_bound = -1 * Math.floor((x_step - 1) / 2),
        x_step_right_bound = Math.floor((x_step - 1) / 2);
    let y_step_left_bound = -1 * Math.floor((y_step - 1) / 2),
        y_step_right_bound = Math.floor((y_step - 1) / 2);
    let temp_pixel_arr_length = Math.floor(Math.sqrt(pixel_arr.length));
    for (let i = 0; i < temp_pixel_arr_length; i += y_step) {
        for (let j = 0; j < temp_pixel_arr_length; j += x_step) {
            let pixel_index = i * temp_pixel_arr_length + j;
            let avg = 0;
            for (let k = y_step_left_bound; k < y_step_right_bound; ++k) {
                for (let l = x_step_left_bound; l < x_step_right_bound; ++l) {
                    pixel_index = (i + k) * temp_pixel_arr_length + (j + l);
                    avg += pixel_arr[pixel_index];
                }
            }
            avg = avg / (x_step * y_step);
            new_pixel_arr.push(avg);
        }
    }
    return new_pixel_arr;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    let temp = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let grayscales = [];
    for (let i = 0; i < temp.data.length; i += 4) {
        let r = temp.data[i + 0];
        let g = temp.data[i + 1];
        let b = temp.data[i + 2];
        let grayscale = rgb_to_grayscale(r, g, b);
        temp.data[i + 0] = grayscale;
        temp.data[i + 1] = grayscale;
        temp.data[i + 2] = grayscale;
        grayscales.push(grayscale);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let scaled_grayscales = reduce_scale(grayscales, kernel);
    let font_size = Math.floor(Math.sqrt(canvas.height * canvas.width / scaled_grayscales.length));
    ctx.font = font_size.toString() + 'px serif';
    let pixel_arr_length = Math.floor(Math.sqrt(scaled_grayscales.length));
    let index = 0;
    for (let i = 0; i < pixel_arr_length; ++i) {
        for (let j = 0; j < pixel_arr_length; ++j) {
            if (index < scaled_grayscales.length && scaled_grayscales[index] === scaled_grayscales[index]) {
                let style = Math.min(255, scaled_grayscales[index] * brightness);
                ctx.fillStyle = 'rgb(' + style.toString() + ',' + style.toString() + ',' + style.toString() + ')';
                ctx.fillText(symbols[gen_int(0, symbols.length)], j * font_size, i * font_size);
            }
            ++index;
        }
    }
    console.log(font_size, scaled_grayscales.length, index);
}
img.src = "test_img.jpg";