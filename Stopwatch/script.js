const time = document.getElementById("timeDisplay");
const startbutton = document.getElementById("startButton");
const stopbutton = document.getElementById("stopButton");
const resetbutton = document.getElementById("resetButton");

const step = 3;
const max = 30;
const tick = 1000;

let sec = 0;
let timer = null;

function showtime() {
  time.textContent = `${sec} s`;
}

function stop() {
  if (timer === null) {
    return;
  }

  clearInterval(timer);
  timer = null;
}

function run() {
  sec += step;

  if (sec >= max) {
    sec = max;
    showtime();
    stop();
    return;
  }

  showtime();
}

function start() {
  if (timer !== null || sec >= max) {
    return;
  }

  timer = setInterval(run, tick);
}

function reset() {
  stop();
  sec = 0;
  showtime();
}

startbutton.addEventListener("click", start);
stopbutton.addEventListener("click", stop);
resetbutton.addEventListener("click", reset);

showtime();
