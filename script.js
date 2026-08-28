const words = [
  "つくえ",
  "つき",
  "くつ",
  "ねこ",
  "いぬ",
  "さかな",
  "すし",
  "バス",
  "アイス"
];

const soundInput = document.getElementById("soundInput");
const searchButton = document.getElementById("searchButton");

const startResults = document.getElementById("startResults");
const middleResults = document.getElementById("middleResults");
const endResults = document.getElementById("endResults");

searchButton.addEventListener("click", function () {
  const sound = soundInput.value.trim();

  // 前の検索結果を消す
  startResults.innerHTML = "";
  middleResults.innerHTML = "";
  endResults.innerHTML = "";

  if (sound === "") {
    alert("音を入力してください");
    return;
  }

  const start = [];
  const middle = [];
  const end = [];

  words.forEach(function (word) {
    if (word.startsWith(sound)) {
      start.push(word);
    }

    if (
      word.includes(sound) &&
      !word.startsWith(sound) &&
      !word.endsWith(sound)
    ) {
      middle.push(word);
    }

    if (word.endsWith(sound)) {
      end.push(word);
    }
  });

  showResults(startResults, start);
  showResults(middleResults, middle);
  showResults(endResults, end);
});

function showResults(element, results) {
  if (results.length === 0) {
    element.textContent = "なし";
    return;
  }

  results.forEach(function (word) {
    const p = document.createElement("p");
    p.textContent = word;
    element.appendChild(p);
  });
}
