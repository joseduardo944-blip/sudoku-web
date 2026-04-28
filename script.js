const boardElement = document.getElementById("board");
const difficultySelect = document.getElementById("difficulty");
const newGameBtn = document.getElementById("new-game");
const themeToggle = document.getElementById("theme-toggle");
const timerElement = document.getElementById("timer");
const bestTimesElement = document.getElementById("best-times");

let board = [];
let selectedCell = null;
let timerInterval;
let seconds = 0;

function formatTime(total){
  const m = String(Math.floor(total/60)).padStart(2,"0");
  const s = String(total%60).padStart(2,"0");
  return `${m}:${s}`;
}

function startTimer(){
  clearInterval(timerInterval);
  seconds = 0;
  timerElement.textContent = "Tiempo: 00:00";
  timerInterval = setInterval(()=>{
    seconds++;
    timerElement.textContent = `Tiempo: ${formatTime(seconds)}`;
  },1000);
}

function renderBestTimes(){
  const times = JSON.parse(localStorage.getItem("sudokuTimes") || "[]");
  bestTimesElement.innerHTML = times.map(t => `<li>${formatTime(t)}</li>`).join("");
}

function saveBestTime(){
  let times = JSON.parse(localStorage.getItem("sudokuTimes") || "[]");
  times.push(seconds);
  times.sort((a,b)=>a-b);
  times = times.slice(0,5);
  localStorage.setItem("sudokuTimes", JSON.stringify(times));
  renderBestTimes();
}

function generatePuzzle(){
  let remove = 40;
  if (difficultySelect.value === "easy") remove = 30;
  if (difficultySelect.value === "hard") remove = 55;

  const solved = [
    [5,3,4,6,7,8,9,1,2],
    [6,7,2,1,9,5,3,4,8],
    [1,9,8,3,4,2,5,6,7],
    [8,5,9,7,6,1,4,2,3],
    [4,2,6,8,5,3,7,9,1],
    [7,1,3,9,2,4,8,5,6],
    [9,6,1,5,3,7,2,8,4],
    [2,8,7,4,1,9,6,3,5],
    [3,4,5,2,8,6,1,7,9]
  ];

  board = solved.map(r => [...r]);

  while(remove > 0){
    const row = Math.floor(Math.random()*9);
    const col = Math.floor(Math.random()*9);
    if(board[row][col] !== 0){
      board[row][col] = 0;
      remove--;
    }
  }
}

function clearHighlights(){
  document.querySelectorAll(".cell").forEach(c=>{
    c.classList.remove("selected","highlight");
  });
}

function selectCell(cell){
  if(cell.classList.contains("fixed")) return;
  clearHighlights();
  selectedCell = cell;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);

  document.querySelectorAll(".cell").forEach(other=>{
    const r = Number(other.dataset.row);
    const c = Number(other.dataset.col);
    if(r === row || c === col){
      other.classList.add("highlight");
    }
  });

  cell.classList.remove("highlight");
  cell.classList.add("selected");
}

function renderBoard(){
  boardElement.innerHTML = "";
  for(let row=0; row<9; row++){
    for(let col=0; col<9; col++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;

      if(board[row][col] !== 0){
        cell.textContent = board[row][col];
        cell.classList.add("fixed");
      }

      cell.addEventListener("click", ()=>selectCell(cell));
      boardElement.appendChild(cell);
    }
  }
}

document.addEventListener("keydown",(e)=>{
  if(!selectedCell) return;
  const row = Number(selectedCell.dataset.row);
  const col = Number(selectedCell.dataset.col);

  if(/^[1-9]$/.test(e.key)){
    selectedCell.textContent = e.key;
    selectedCell.classList.add("user");
    board[row][col] = Number(e.key);
  }

  if(e.key === "Backspace" || e.key === "Delete"){
    selectedCell.textContent = "";
    selectedCell.classList.remove("user");
    board[row][col] = 0;
  }

  const complete = board.every(r => r.every(v => v !== 0));
  if(complete){
    clearInterval(timerInterval);
    saveBestTime();
  }
});

function startGame(){
  generatePuzzle();
  renderBoard();
  startTimer();
  renderBestTimes();
}

themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("dark");
});

newGameBtn.addEventListener("click", startGame);

startGame();
