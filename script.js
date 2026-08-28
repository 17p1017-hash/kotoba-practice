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


  // --------------------
  // ふつうのことば
  // --------------------

  const wordResults =
    classifyWords(words, sound);

  showWordResults(
    wordStartResults,
    wordResults.start
  );

  showWordResults(
    wordMiddleResults,
    wordResults.middle
  );

  showWordResults(
    wordEndResults,
    wordResults.end
  );


  // --------------------
  // ポケモン
  // --------------------

  const pokemonWithNumbers =
    pokemon.map(function (name, index) {
      return {
        name: name,
        number: index + 1
      };
    });


  const pokemonResults =
    classifyPokemon(
      pokemonWithNumbers,
      sound
    );


  showPokemonResults(
    pokemonStartResults,
    pokemonResults.start
  );

  showPokemonResults(
    pokemonMiddleResults,
    pokemonResults.middle
  );

  showPokemonResults(
    pokemonEndResults,
    pokemonResults.end
  );
}


// ====================
// ふつうのことば分類
// ====================

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


// ====================
// ポケモン分類
// ====================

function classifyPokemon(list, sound) {

  const start = [];
  const middle = [];
  const end = [];

  list.forEach(function (pokemonData) {

    const normalizedName =
      normalizeKana(pokemonData.name);

    if (!normalizedName.includes(sound)) {
      return;
    }

    if (normalizedName.startsWith(sound)) {
      start.push(pokemonData);
      return;
    }

    if (normalizedName.endsWith(sound)) {
      end.push(pokemonData);
      return;
    }

    middle.push(pokemonData);
  });


  return {
    start,
    middle,
    end
  };
}


// ====================
// ふつうのことば表示
// ====================

function showWordResults(element, results) {

  if (results.length === 0) {
    element.textContent = "なし";
    return;
  }


  results.forEach(function (word) {

    const p =
      document.createElement("p");

    p.textContent = word;

    element.appendChild(p);
  });
}


// ====================
// ポケモン表示
// 画像 + 図鑑番号 + 公式ずかんリンク
// ====================

function showPokemonResults(element, results) {

  if (results.length === 0) {
    element.textContent = "なし";
    return;
  }


  results.forEach(function (pokemonData) {

    const numberText =
      String(pokemonData.number).padStart(4, "0");


    // 公式ずかんへのリンク
    const link =
      document.createElement("a");

    link.href =
      "https://zukan.pokemon.co.jp/detail/" +
      numberText;

    link.target = "_blank";
    link.rel = "noopener noreferrer";

    link.style.display = "block";
    link.style.textDecoration = "none";
    link.style.color = "inherit";


    // カード
    const card =
      document.createElement("div");

    card.style.display = "flex";
    card.style.alignItems = "center";
    card.style.gap = "12px";
    card.style.background = "#ffffff";
    card.style.borderRadius = "16px";
    card.style.padding = "10px";
    card.style.marginBottom = "10px";
    card.style.cursor = "pointer";
    card.style.boxShadow =
      "0 2px 8px rgba(0, 0, 0, 0.06)";


    // ポケモン画像
    const image =
      document.createElement("img");

    image.src =
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
      pokemonData.number +
      ".png";

    image.alt = pokemonData.name;

    image.width = 80;
    image.height = 80;
    image.loading = "lazy";


    // 文字部分
    const text =
      document.createElement("div");


    // 名前
    const name =
      document.createElement("div");

    name.textContent =
      pokemonData.name;

    name.style.fontSize = "20px";
    name.style.fontWeight = "bold";


    // 図鑑番号
    const number =
      document.createElement("div");

    number.textContent =
      "No." + numberText;

    number.style.fontSize = "13px";
    number.style.color = "#888";
    number.style.marginTop = "3px";


    // 公式ずかん案内
    const guide =
      document.createElement("div");

    guide.textContent =
      "公式ポケモンずかんを見る →";

    guide.style.fontSize = "13px";
    guide.style.marginTop = "5px";
    guide.style.color = "#7d6aac";


    text.appendChild(name);
    text.appendChild(number);
    text.appendChild(guide);

    card.appendChild(image);
    card.appendChild(text);

    link.appendChild(card);

    element.appendChild(link);
  });
}


// ====================
// 結果を消す
// ====================

function clearResults() {

  wordStartResults.innerHTML = "";
  wordMiddleResults.innerHTML = "";
  wordEndResults.innerHTML = "";

  pokemonStartResults.innerHTML = "";
  pokemonMiddleResults.innerHTML = "";
  pokemonEndResults.innerHTML = "";
}


// ====================
// ひらがな・カタカナ統一
// ====================

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
