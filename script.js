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

      const item =
        createPracticeItem(
          word,
          word
        );


      element.appendChild(
        item
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


      const practice =
        createPracticeControls(
          pokemonData.name
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "practice-item";


      item.appendChild(
        link
      );


      item.appendChild(
        practice
      );


      element.appendChild(
        item
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


      const practice =
        createPracticeControls(
          monster.reading
        );


      const item =
        document.createElement(
          "div"
        );


      item.className =
        "practice-item";


      item.appendChild(
        link
      );


      item.appendChild(
        practice
      );


      element.appendChild(
        item
      );

    }
  );

}



// ========================
// 発音チェック
// ========================

function createPracticeItem(
  label,
  reading
) {

  const item =
    document.createElement(
      "div"
    );


  item.className =
    "practice-item";


  const row =
    document.createElement(
      "div"
    );


  row.className =
    "practice-row";


  const word =
    document.createElement(
      "div"
    );


  word.className =
    "practice-word";


  word.textContent =
    label;


  row.appendChild(
    word
  );


  item.appendChild(
    row
  );


  item.appendChild(
    createPracticeControls(
      reading,
      row
    )
  );


  return item;

}


function createPracticeControls(
  reading,
  buttonRow = null
) {

  const wrapper =
    document.createElement(
      "div"
    );


  const button =
    document.createElement(
      "button"
    );


  button.type =
    "button";


  button.className =
    "practice-button";


  button.textContent =
    "🎤 発音する";


  const status =
    document.createElement(
      "div"
    );


  status.className =
    "practice-status";


  button.addEventListener(
    "click",
    function () {

      startPronunciationCheck(
        reading,
        status,
        button
      );

    }
  );


  if (
    buttonRow
  ) {

    buttonRow.appendChild(
      button
    );

  } else {

    wrapper.appendChild(
      button
    );

  }


  wrapper.appendChild(
    status
  );


  return wrapper;

}


function startPronunciationCheck(
  targetReading,
  statusElement,
  button
) {

  const SpeechRecognition =
    window.SpeechRecognition
    ||
    window.webkitSpeechRecognition;


  resetPracticeStatus(
    statusElement
  );


  if (
    !SpeechRecognition
  ) {

    statusElement.textContent =
      "このブラウザーでは音声認識を使えません。Chrome系ブラウザーで試してください。";


    statusElement.classList.add(
      "error"
    );


    return;

  }


  const recognition =
    new SpeechRecognition();


  recognition.lang =
    "ja-JP";


  recognition.continuous =
    false;


  recognition.interimResults =
    false;


  recognition.maxAlternatives =
    5;


  button.disabled =
    true;


  button.textContent =
    "🎤 きいています…";


  statusElement.textContent =
    "ことばを1回、はっきり言ってみよう";


  recognition.onresult =
    function (event) {

      const result =
        event.results[0];


      const alternatives = [];


      for (
        let i = 0;
        i < result.length;
        i++
      ) {

        alternatives.push(
          result[i].transcript
        );

      }


      showPronunciationResult(
        targetReading,
        alternatives,
        statusElement
      );

    };


  recognition.onerror =
    function (event) {

      resetPracticeStatus(
        statusElement
      );


      if (
        event.error === "not-allowed"
        ||
        event.error === "service-not-allowed"
      ) {

        statusElement.textContent =
          "マイクの使用が許可されていません。ブラウザーの設定でマイクを許可してください。";

      } else if (
        event.error === "no-speech"
      ) {

        statusElement.textContent =
          "声を聞き取れませんでした。もう一度やってみよう。";

      } else {

        statusElement.textContent =
          "音声認識がうまく動きませんでした。もう一度試してください。";

      }


      statusElement.classList.add(
        "error"
      );

    };


  recognition.onend =
    function () {

      button.disabled =
        false;


      button.textContent =
        "🎤 発音する";

    };


  try {

    recognition.start();

  } catch (error) {

    button.disabled =
      false;


    button.textContent =
      "🎤 発音する";


    statusElement.textContent =
      "音声認識を開始できませんでした。少し待ってからもう一度試してください。";


    statusElement.classList.add(
      "error"
    );

  }

}


function showPronunciationResult(
  targetReading,
  alternatives,
  statusElement
) {

  resetPracticeStatus(
    statusElement
  );


  const target =
    normalizeSpeechText(
      targetReading
    );


  const normalizedAlternatives =
    alternatives.map(
      function (text) {

        return normalizeSpeechText(
          text
        );

      }
    );


  const exactIndex =
    normalizedAlternatives.findIndex(
      function (text) {

        return text === target;

      }
    );


  if (
    exactIndex !== -1
  ) {

    statusElement.textContent =
      "🎉 できた！「" +
      alternatives[exactIndex] +
      "」と聞こえました。";


    statusElement.classList.add(
      "success"
    );


    return;

  }


  let bestIndex = 0;
  let bestScore = 0;


  normalizedAlternatives.forEach(
    function (text, index) {

      const score =
        similarityScore(
          target,
          text
        );


      if (
        score > bestScore
      ) {

        bestScore =
          score;


        bestIndex =
          index;

      }

    }
  );


  if (
    bestScore >= 0.65
  ) {

    statusElement.textContent =
      "🙂 おしい！「" +
      alternatives[bestIndex] +
      "」と聞こえました。もう一回やってみよう。";


    statusElement.classList.add(
      "near"
    );


    return;

  }


  statusElement.textContent =
    "🔁 「" +
    alternatives[0] +
    "」と聞こえました。もう一度ゆっくり言ってみよう。";


  statusElement.classList.add(
    "error"
  );

}


function resetPracticeStatus(
  statusElement
) {

  statusElement.className =
    "practice-status";

}


function normalizeSpeechText(
  text
) {

  return normalizeKana(
    String(text)
      .replace(
        /[、。,.!?！？「」『』（）()\-ー\s]/g,
        ""
      )
  );

}


function similarityScore(
  left,
  right
) {

  if (
    left === right
  ) {

    return 1;

  }


  const maxLength =
    Math.max(
      left.length,
      right.length
    );


  if (
    maxLength === 0
  ) {

    return 1;

  }


  const distance =
    levenshteinDistance(
      left,
      right
    );


  return 1 -
    distance /
    maxLength;

}


function levenshteinDistance(
  left,
  right
) {

  const rows =
    left.length + 1;


  const columns =
    right.length + 1;


  const matrix =
    Array.from(
      { length: rows },
      function () {

        return new Array(
          columns
        ).fill(0);

      }
    );


  for (
    let i = 0;
    i < rows;
    i++
  ) {

    matrix[i][0] =
      i;

  }


  for (
    let j = 0;
    j < columns;
    j++
  ) {

    matrix[0][j] =
      j;

  }


  for (
    let i = 1;
    i < rows;
    i++
  ) {

    for (
      let j = 1;
      j < columns;
      j++
    ) {

      const cost =
        left[i - 1] === right[j - 1]
        ? 0
        : 1;


      matrix[i][j] =
        Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );

    }

  }


  return matrix[rows - 1][columns - 1];

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
