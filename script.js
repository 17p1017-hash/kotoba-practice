let words = [];
let pokemon = [];
let monsters = [];


// ========================
// HTML取得
// ========================

const soundInput =
  document.getElementById("soundInput");


const wordSearchButton =
  document.getElementById("wordSearchButton");


const pokemonSearchButton =
  document.getElementById("pokemonSearchButton");


const monsterSearchButton =
  document.getElementById("monsterSearchButton");



const wordResultsSection =
  document.getElementById(
    "wordResultsSection"
  );


const pokemonResultsSection =
  document.getElementById(
    "pokemonResultsSection"
  );


const monsterResultsSection =
  document.getElementById(
    "monsterResultsSection"
  );



const wordStartResults =
  document.getElementById(
    "wordStartResults"
  );


const wordMiddleResults =
  document.getElementById(
    "wordMiddleResults"
  );


const wordEndResults =
  document.getElementById(
    "wordEndResults"
  );



const pokemonStartResults =
  document.getElementById(
    "pokemonStartResults"
  );


const pokemonMiddleResults =
  document.getElementById(
    "pokemonMiddleResults"
  );


const pokemonEndResults =
  document.getElementById(
    "pokemonEndResults"
  );



const monsterStartResults =
  document.getElementById(
    "monsterStartResults"
  );


const monsterMiddleResults =
  document.getElementById(
    "monsterMiddleResults"
  );


const monsterEndResults =
  document.getElementById(
    "monsterEndResults"
  );



// ========================
// データ読み込み
// ========================

async function loadData() {

  try {

    const [
      wordsResponse,
      pokemonResponse,
      monsterResponse
    ] =
      await Promise.all([

        fetch(
          "./data/words.json"
        ),

        fetch(
          "./data/pokemon.json"
        ),

        fetch(
          "./data/monsterhunter.json"
        )

      ]);


    if (!wordsResponse.ok) {

      throw new Error(
        "words.jsonを読み込めませんでした"
      );

    }


    if (!pokemonResponse.ok) {

      throw new Error(
        "pokemon.jsonを読み込めませんでした"
      );

    }


    if (!monsterResponse.ok) {

      throw new Error(
        "monsterhunter.jsonを読み込めませんでした"
      );

    }


    words =
      await wordsResponse.json();


    pokemon =
      await pokemonResponse.json();


    monsters =
      await monsterResponse.json();


    console.log(
      "ふつうのことば:",
      words.length
    );


    console.log(
      "ポケモン:",
      pokemon.length
    );


    console.log(
      "モンハン:",
      monsters.length
    );


  } catch (error) {

    console.error(error);


    alert(
      "ことばデータの読み込みに失敗しました"
    );

  }

}


loadData();



// ========================
// ふつうのことば検索
// ========================

wordSearchButton.addEventListener(
  "click",
  function () {

    const sound =
      getSearchSound();


    if (!sound) {
      return;
    }


    clearResults();


    showOnlySection(
      wordResultsSection
    );


    const results =
      classifySimpleWords(
        words,
        sound
      );


    showWordResults(
      wordStartResults,
      results.start
    );


    showWordResults(
      wordMiddleResults,
      results.middle
    );


    showWordResults(
      wordEndResults,
      results.end
    );

  }
);



// ========================
// ポケモン検索
// ========================

pokemonSearchButton.addEventListener(
  "click",
  function () {

    const sound =
      getSearchSound();


    if (!sound) {
      return;
    }


    clearResults();


    showOnlySection(
      pokemonResultsSection
    );


    const pokemonWithNumbers =
      pokemon.map(
        function (name, index) {

          return {

            name: name,

            number:
              index + 1

          };

        }
      );


    const results =
      classifyObjects(
        pokemonWithNumbers,
        sound,
        function (item) {

          return item.name;

        }
      );


    showPokemonResults(
      pokemonStartResults,
      results.start
    );


    showPokemonResults(
      pokemonMiddleResults,
      results.middle
    );


    showPokemonResults(
      pokemonEndResults,
      results.end
    );

  }
);



// ========================
// モンハン検索
// ========================

monsterSearchButton.addEventListener(
  "click",
  function () {

    const sound =
      getSearchSound();


    if (!sound) {
      return;
    }


    clearResults();


    showOnlySection(
      monsterResultsSection
    );


    const results =
      classifyObjects(
        monsters,
        sound,
        function (monster) {

          return monster.reading;

        }
      );


    showMonsterResults(
      monsterStartResults,
      results.start
    );


    showMonsterResults(
      monsterMiddleResults,
      results.middle
    );


    showMonsterResults(
      monsterEndResults,
      results.end
    );

  }
);



// ========================
// 入力された音
// ========================

function getSearchSound() {

  const rawSound =
    soundInput.value.trim();


  if (rawSound === "") {

    alert(
      "練習したい音を入力してください"
    );


    soundInput.focus();


    return null;

  }


  return normalizeKana(
    rawSound
  );

}



// ========================
// ふつうのことば分類
// ========================

function classifySimpleWords(
  list,
  sound
) {

  const start = [];
  const middle = [];
  const end = [];


  list.forEach(
    function (word) {

      const normalizedWord =
        normalizeKana(word);


      classifyOne(
        word,
        normalizedWord,
        sound,
        start,
        middle,
        end
      );

    }
  );


  return {
    start,
    middle,
    end
  };

}



// ========================
// オブジェクト分類
// ポケモン・モンハン共通
// ========================

function classifyObjects(
  list,
  sound,
  getReading
) {

  const start = [];
  const middle = [];
  const end = [];


  list.forEach(
    function (item) {

      const reading =
        normalizeKana(
          getReading(item)
        );


      classifyOne(
        item,
        reading,
        sound,
        start,
        middle,
        end
      );

    }
  );


  return {
    start,
    middle,
    end
  };

}



// ========================
// 1件の分類
// ========================

function classifyOne(
  item,
  reading,
  sound,
  start,
  middle,
  end
) {

  if (
    !reading.includes(sound)
  ) {

    return;

  }


  if (
    reading.startsWith(sound)
  ) {

    start.push(item);

    return;

  }


  if (
    reading.endsWith(sound)
  ) {

    end.push(item);

    return;

  }


  middle.push(item);

}



// ========================
// 普通のことば表示
// ========================

function showWordResults(
  element,
  results
) {

  if (
    results.length === 0
  ) {

    element.textContent =
      "なし";


    return;

  }


  results.forEach(
    function (word) {

      const p =
        document.createElement(
          "p"
        );


      p.textContent =
        word;


      element.appendChild(
        p
      );

    }
  );

}



// ========================
// ポケモン表示
// ========================

function showPokemonResults(
  element,
  results
) {

  if (
    results.length === 0
  ) {

    element.textContent =
      "なし";


    return;

  }


  results.forEach(
    function (pokemonData) {

      const numberText =
        String(
          pokemonData.number
        ).padStart(
          4,
          "0"
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        "https://zukan.pokemon.co.jp/detail/" +
        numberText;


      link.target =
        "_blank";


      link.rel =
        "noopener noreferrer";


      link.className =
        "card-link";



      const card =
        document.createElement(
          "div"
        );


      card.className =
        "result-card";



      const image =
        document.createElement(
          "img"
        );


      image.src =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" +
        pokemonData.number +
        ".png";


      image.alt =
        pokemonData.name;


      image.loading =
        "lazy";



      const text =
        document.createElement(
          "div"
        );



      const name =
        document.createElement(
          "div"
        );


      name.className =
        "card-name";


      name.textContent =
        pokemonData.name;



      const number =
        document.createElement(
          "div"
        );


      number.className =
        "card-sub";


      number.textContent =
        "No." +
        numberText;



      const guide =
        document.createElement(
          "div"
        );


      guide.className =
        "card-sub";


      guide.textContent =
        "公式ポケモンずかんを見る →";



      text.appendChild(
        name
      );


      text.appendChild(
        number
      );


      text.appendChild(
        guide
      );


      card.appendChild(
        image
      );


      card.appendChild(
        text
      );


      link.appendChild(
        card
      );


      element.appendChild(
        link
      );

    }
  );

}



// ========================
// モンハン表示
// ========================

function showMonsterResults(
  element,
  results
) {

  if (
    results.length === 0
  ) {

    element.textContent =
      "なし";


    return;

  }


  results.forEach(
    function (monster) {

      const link =
        document.createElement(
          "a"
        );


      link.href =
        "https://monsterhunternow.com/ja/monsters/" +
        monster.slug;


      link.target =
        "_blank";


      link.rel =
        "noopener noreferrer";


      link.className =
        "card-link";



      const card =
        document.createElement(
          "div"
        );


      card.className =
        "result-card";



      /*
        monsterhunter.json に
        image が入っている場合は
        写真を表示します
      */

      if (
        monster.image
      ) {

        const image =
          document.createElement(
            "img"
          );


        image.src =
          monster.image;


        image.alt =
          monster.name;


        image.loading =
          "lazy";


        card.appendChild(
          image
        );

      }



      const text =
        document.createElement(
          "div"
        );



      const name =
        document.createElement(
          "div"
        );


      name.className =
        "card-name";


      name.textContent =
        monster.name;



      const guide =
        document.createElement(
          "div"
        );


      guide.className =
        "card-sub";


      guide.textContent =
        "Monster Hunter Now公式を見る →";



      text.appendChild(
        name
      );


      text.appendChild(
        guide
      );


      card.appendChild(
        text
      );


      link.appendChild(
        card
      );


      element.appendChild(
        link
      );

    }
  );

}



// ========================
// 表示するカテゴリ
// ========================

function showOnlySection(
  section
) {

  wordResultsSection
    .classList
    .remove(
      "show"
    );


  pokemonResultsSection
    .classList
    .remove(
      "show"
    );


  monsterResultsSection
    .classList
    .remove(
      "show"
    );


  section
    .classList
    .add(
      "show"
    );

}



// ========================
// 結果を消す
// ========================

function clearResults() {

  wordStartResults.innerHTML =
    "";


  wordMiddleResults.innerHTML =
    "";


  wordEndResults.innerHTML =
    "";


  pokemonStartResults.innerHTML =
    "";


  pokemonMiddleResults.innerHTML =
    "";


  pokemonEndResults.innerHTML =
    "";


  monsterStartResults.innerHTML =
    "";


  monsterMiddleResults.innerHTML =
    "";


  monsterEndResults.innerHTML =
    "";

}



// ========================
// ひらがな・カタカナ統一
// ========================

function normalizeKana(
  text
) {

  return String(text)

    .normalize(
      "NFKC"
    )

    .replace(
      /[・\s]/g,
      ""
    )

    .replace(
      /[\u30a1-\u30f6]/g,

      function (match) {

        return String.fromCharCode(
          match.charCodeAt(0)
          -
          0x60
        );

      }

    );

}
