let words = [];
let pokemon = [];

const soundInput = document.getElementById("soundInput");
const searchButton = document.getElementById("searchButton");

const wordStartResults =
  document.getElementById("wordStartResults");
const wordMiddleResults =
  document.getElementById("wordMiddleResults");
const wordEndResults =
  document.getElementById("wordEndResults");

const pokemonStartResults =
  document.getElementById("pokemonStartResults");
const pokemonMiddleResults =
  document.getElementById("pokemonMiddleResults");
const pokemonEndResults =
  document.getElementById("pokemonEndResults");

async function loadData() {
  try {
    const [wordsResponse, pokemonResponse] =
      await Promise.all([
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

    console.log("ふつうのことば:", words.length);
    console.log("ポケモン:", pokemon.length);

  } catch (error) {
    console.error(error);
    alert("ことばデータの読み込みに失敗しました");
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

  clearResults();

  if (rawSound === "") {
    alert("練習したい音を入力してください");
    return;
  }

  const sound = normalizeKana(rawSound);

  // ふつうのことば
  const wordResults = classifyWords(words, sound);

  showResults(
    wordStartResults,
    wordResults.start
  );

  showResults(
    wordMiddleResults,
    wordResults.middle
  );

  showResults(
    wordEndResults,
    wordResults.end
  );

  // ポケモン
  const pokemonResults =
    classifyWords(pokemon, sound);

  showResults(
    pokemonStartResults,
    pokemonResults.start
  );

  showResults(
    pokemonMiddleResults,
    pokemonResults.middle
  );

  showResults(
    pokemonEndResults,
    pokemonResults.end
  );
}

function classifyWords(list, sound) {
  const start = [];
  const middle = [];
  const end = [];

  list.forEach(function (word) {
    const normalizedWord =
      normalizeKana(word);

    if (!normalizedWord.includes(sound)) {
      return;
    }

    if (normalizedWord.startsWith(sound)) {
      start.push(word);
      return;
    }

    if (normalizedWord.endsWith(sound)) {
      end.push(word);
      return;
    }

    middle.push(word);
  });

  return {
    start,
    middle,
    end
  };
}

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

function clearResults() {
  wordStartResults.innerHTML = "";
  wordMiddleResults.innerHTML = "";
  wordEndResults.innerHTML = "";

  pokemonStartResults.innerHTML = "";
  pokemonMiddleResults.innerHTML = "";
  pokemonEndResults.innerHTML = "";
}

function normalizeKana(text) {
  return text
    .normalize("NFKC")
    .replace(
      /[\u30a1-\u30f6]/g,
      function (match) {
        return String.fromCharCode(
          match.charCodeAt(0) - 0x60
        );
      }
    );
}
