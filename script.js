let words = [];
let pokemon = [];

const soundInput = document.getElementById("soundInput");
const searchButton = document.getElementById("searchButton");

const startResults = document.getElementById("startResults");
const middleResults = document.getElementById("middleResults");
const endResults = document.getElementById("endResults");

async function loadData() {
  try {
    const [wordsResponse, pokemonResponse] = await Promise.all([
      fetch("./data/words.json"),
      fetch("./data/pokemon.json")
    ]);

    if (!wordsResponse.ok) {
      throw new Error("words.jsonを読み込めませんでした");
    }

    if (!pokemonResponse.ok) {
      throw new Error("pokemon.jsonを読み込めませんでした");
    }

    words = await wordsResponse.json();
    pokemon = await pokemonResponse.json();

    console.log("一般語:", words.length);
    console.log("ポケモン:", pokemon.length);
  } catch (error) {
    console.error(error);
    alert("単語データの読み込みに失敗しました");
  }
}

loadData();

searchButton.addEventListener("click", searchWords);

soundInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    searchWords();
  }
});

function searchWords() {
  const rawSound = soundInput.value.trim();

  startResults.innerHTML = "";
  middleResults.innerHTML = "";
  endResults.innerHTML = "";

  if (rawSound === "") {
    alert("練習したい音を入力してください");
    return;
  }

  const sound = normalizeKana(rawSound);

  const allItems = [
    ...words.map(function (word) {
      return {
        name: word,
        type: "ことば"
      };
    }),

    ...pokemon.map(function (name) {
      return {
        name: name,
        type: "ポケモン"
      };
    })
  ];

  const start = [];
  const middle = [];
  const end = [];

  allItems.forEach(function (item) {
    const normalizedWord = normalizeKana(item.name);

    if (!normalizedWord.includes(sound)) {
      return;
    }

    if (normalizedWord.startsWith(sound)) {
      start.push(item);
      return;
    }

    if (normalizedWord.endsWith(sound)) {
      end.push(item);
      return;
    }

    middle.push(item);
  });

  showResults(startResults, start);
  showResults(middleResults, middle);
  showResults(endResults, end);
}

function showResults(element, results) {
  if (results.length === 0) {
    element.textContent = "なし";
    return;
  }

  results.forEach(function (item) {
    const p = document.createElement("p");

    if (item.type === "ポケモン") {
      p.textContent = item.name + "　【ポケモン】";
    } else {
      p.textContent = item.name;
    }

    element.appendChild(p);
  });
}

function normalizeKana(text) {
  return text
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, function (match) {
      return String.fromCharCode(
        match.charCodeAt(0) - 0x60
      );
    });
}
