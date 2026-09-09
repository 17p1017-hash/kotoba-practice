// ========================================================
// ことば検索 + 発音チェック
//
// ・ふつうのことば
// ・ポケモン
// ・モンハン
//
// 音声認識結果が
// 「あさ」→「朝」
// 「くつ」→「靴」
// のように漢字変換されても、
// kuromoji.js で読みを取得して判定します。
// ========================================================


let words = [];
let pokemon = [];
let monsters = [];


// ========================================================
// kuromoji
// ========================================================

let kuromojiTokenizer = null;

let kuromojiLoadingPromise = null;


const KUROMOJI_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js";


const KUROMOJI_DIC_PATH =
  "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/";


// ========================================================
// HTML取得
// ========================================================

const soundInput =
  document.getElementById(
    "soundInput"
  );


const wordSearchButton =
  document.getElementById(
    "wordSearchButton"
  );


const pokemonSearchButton =
  document.getElementById(
    "pokemonSearchButton"
  );


const monsterSearchButton =
  document.getElementById(
    "monsterSearchButton"
  );



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


// ========================================================
// 起動
// ========================================================

loadData();


// kuromojiは先に読み込みを始めておく
loadKuromoji()
  .catch(
    function (error) {

      console.warn(
        "kuromojiの事前読み込みに失敗:",
        error
      );

    }
  );


// ========================================================
// データ読み込み
// ========================================================

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


    const rawWords =
      await wordsResponse.json();


    const rawPokemon =
      await pokemonResponse.json();


    const rawMonsters =
      await monsterResponse.json();



    // ----------------------------------------
    // 普通のことば
    //
    // 現在の
    // "あさ"
    //
    // という形式にも、
    //
    // {
    //   "name": "朝",
    //   "reading": "あさ"
    // }
    //
    // という将来の形式にも対応
    // ----------------------------------------

    words =
      rawWords.map(
        function (item) {

          return normalizeWordData(
            item
          );

        }
      );



    // ----------------------------------------
    // ポケモン
    //
    // 現在の
    // "フシギダネ"
    //
    // 形式にも、
    //
    // {
    //   "name": "フシギダネ",
    //   "reading": "ふしぎだね"
    // }
    //
    // にも対応
    // ----------------------------------------

    pokemon =
      rawPokemon.map(
        function (
          item,
          index
        ) {

          return normalizePokemonData(
            item,
            index
          );

        }
      );



    // ----------------------------------------
    // モンハン
    // ----------------------------------------

    monsters =
      rawMonsters.map(
        function (item) {

          return normalizeMonsterData(
            item
          );

        }
      );


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

    console.error(
      error
    );


    alert(
      "ことばデータの読み込みに失敗しました"
    );

  }

}


// ========================================================
// 普通のことばデータを統一
// ========================================================

function normalizeWordData(
  item
) {

  // 今までの形式
  //
  // "あさ"

  if (
    typeof item === "string"
  ) {

    return {

      name:
        item,

      reading:
        normalizeKana(
          item
        ),

      aliases:
        []

    };

  }


  // 新しい形式にも対応

  const name =
    item.name
    ||
    item.word
    ||
    item.label
    ||
    item.reading
    ||
    "";


  const reading =
    item.reading
    ||
    item.kana
    ||
    name;


  return {

    ...item,

    name:
      name,

    reading:
      normalizeKana(
        reading
      ),

    aliases:
      Array.isArray(
        item.aliases
      )
        ?
        item.aliases
        :
        []

  };

}


// ========================================================
// ポケモンデータを統一
// ========================================================

function normalizePokemonData(
  item,
  index
) {

  // 今までの形式
  //
  // "フシギダネ"

  if (
    typeof item === "string"
  ) {

    return {

      name:
        item,

      reading:
        normalizeKana(
          item
        ),

      number:
        index + 1,

      aliases:
        []

    };

  }


  const name =
    item.name
    ||
    item.word
    ||
    "";


  const reading =
    item.reading
    ||
    item.kana
    ||
    name;


  return {

    ...item,

    name:
      name,

    reading:
      normalizeKana(
        reading
      ),

    number:
      item.number
      ||
      item.id
      ||
      index + 1,

    aliases:
      Array.isArray(
        item.aliases
      )
        ?
        item.aliases
        :
        []

  };

}


// ========================================================
// モンハンデータを統一
// ========================================================

function normalizeMonsterData(
  item
) {

  const name =
    item.name
    ||
    item.word
    ||
    "";


  const reading =
    item.reading
    ||
    item.kana
    ||
    name;


  return {

    ...item,

    name:
      name,

    reading:
      normalizeKana(
        reading
      ),

    aliases:
      Array.isArray(
        item.aliases
      )
        ?
        item.aliases
        :
        []

  };

}


// ========================================================
// 普通のことば検索
// ========================================================

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
      classifyItems(
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


// ========================================================
// ポケモン検索
// ========================================================

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


    const results =
      classifyItems(
        pokemon,
        sound
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


// ========================================================
// モンハン検索
// ========================================================

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
      classifyItems(
        monsters,
        sound
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


// ========================================================
// 検索する音
// ========================================================

function getSearchSound() {

  const rawSound =
    soundInput.value.trim();


  if (
    rawSound === ""
  ) {

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


// ========================================================
// 語頭・語中・語尾に分類
// ========================================================

function classifyItems(
  list,
  sound
) {

  const start = [];
  const middle = [];
  const end = [];


  list.forEach(
    function (item) {

      const reading =
        normalizeKana(
          item.reading
        );


      if (
        !reading.includes(
          sound
        )
      ) {

        return;

      }


      if (
        reading.startsWith(
          sound
        )
      ) {

        start.push(
          item
        );


        return;

      }


      if (
        reading.endsWith(
          sound
        )
      ) {

        end.push(
          item
        );


        return;

      }


      middle.push(
        item
      );

    }
  );


  return {

    start:
      start,

    middle:
      middle,

    end:
      end

  };

}


// ========================================================
// 普通のことば表示
// ========================================================

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
    function (wordData) {

      const item =
        createPracticeItem(
          wordData
        );


      element.appendChild(
        item
      );

    }
  );

}


// ========================================================
// ポケモン表示
// ========================================================

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

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "practice-item";


      const link =
        document.createElement(
          "a"
        );


      const numberText =
        String(
          pokemonData.number
        ).padStart(
          4,
          "0"
        );


      link.href =
        "https://zukan.pokemon.co.jp/detail/"
        +
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
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/"
        +
        pokemonData.number
        +
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
        "No."
        +
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


      item.appendChild(
        link
      );


      item.appendChild(
        createPracticeControls(
          pokemonData
        )
      );


      element.appendChild(
        item
      );

    }
  );

}


// ========================================================
// モンハン表示
// ========================================================

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
    function (monsterData) {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "practice-item";


      const link =
        document.createElement(
          "a"
        );


      link.href =
        "https://monsterhunternow.com/ja/monsters/"
        +
        monsterData.slug;


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


      if (
        monsterData.image
      ) {

        const image =
          document.createElement(
            "img"
          );


        image.src =
          monsterData.image;


        image.alt =
          monsterData.name;


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
        monsterData.name;


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


      item.appendChild(
        link
      );


      item.appendChild(
        createPracticeControls(
          monsterData
        )
      );


      element.appendChild(
        item
      );

    }
  );

}


// ========================================================
// 普通のことば用カード
// ========================================================

function createPracticeItem(
  wordData
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
    wordData.name;


  row.appendChild(
    word
  );


  item.appendChild(
    row
  );


  item.appendChild(
    createPracticeControls(
      wordData,
      row
    )
  );


  return item;

}


// ========================================================
// 発音ボタン
// ========================================================

function createPracticeControls(
  itemData,
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
        itemData,
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


// ========================================================
// 音声認識開始
// ========================================================

function startPronunciationCheck(
  targetData,
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


  // 複数候補を見る
  recognition.maxAlternatives =
    5;


  button.disabled =
    true;


  button.textContent =
    "🎤 きいています…";


  statusElement.textContent =
    "ことばを1回、はっきり言ってみよう";


  recognition.onresult =
    async function (event) {

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


      statusElement.textContent =
        "判定しています…";


      await showPronunciationResult(
        targetData,
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

    console.error(
      error
    );


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


// ========================================================
// 発音判定
// ========================================================

async function showPronunciationResult(
  targetData,
  alternatives,
  statusElement
) {

  resetPracticeStatus(
    statusElement
  );


  const targetName =
    normalizeSpeechText(
      targetData.name
    );


  const targetReading =
    normalizeSpeechText(
      targetData.reading
    );


  // JSONにaliasesがあれば、それも正解候補にする
  const targetAliases =
    Array.isArray(
      targetData.aliases
    )
      ?
      targetData.aliases
      :
      [];


  const acceptableTexts =
    new Set();


  acceptableTexts.add(
    targetName
  );


  acceptableTexts.add(
    targetReading
  );


  targetAliases.forEach(
    function (alias) {

      acceptableTexts.add(
        normalizeSpeechText(
          alias
        )
      );

    }
  );


  // ----------------------------------------
  // 音声認識候補を全部調べる
  // ----------------------------------------

  const checkedResults = [];


  for (
    let i = 0;
    i < alternatives.length;
    i++
  ) {

    const originalText =
      alternatives[i];


    const normalizedText =
      normalizeSpeechText(
        originalText
      );


    // 漢字を読みへ変換
    const readingText =
      await convertJapaneseToReading(
        originalText
      );


    const normalizedReading =
      normalizeSpeechText(
        readingText
      );


    checkedResults.push({

      original:
        originalText,

      normalized:
        normalizedText,

      reading:
        normalizedReading

    });


    // ----------------------------------------
    // そのまま一致
    //
    // 例:
    // フシギダネ
    // ----------------------------------------

    if (
      acceptableTexts.has(
        normalizedText
      )
    ) {

      showSuccess(
        statusElement,
        originalText,
        normalizedReading
      );


      return;

    }


    // ----------------------------------------
    // 読みで一致
    //
    // 例:
    //
    // 正解 あさ
    // 認識 朝
    //
    // 朝 → アサ → あさ
    // ----------------------------------------

    if (
      normalizedReading
      ===
      targetReading
    ) {

      showSuccess(
        statusElement,
        originalText,
        normalizedReading
      );


      return;

    }


    // aliasesの読みとも比較
    for (
      const alias of targetAliases
    ) {

      const aliasReading =
        await convertJapaneseToReading(
          alias
        );


      if (
        normalizeSpeechText(
          aliasReading
        )
        ===
        normalizedReading
      ) {

        showSuccess(
          statusElement,
          originalText,
          normalizedReading
        );


        return;

      }

    }

  }


  // ======================================================
  // 完全一致しなかった場合
  // 一番近い読みを探す
  // ======================================================

  let bestResult =
    null;


  let bestScore =
    0;


  checkedResults.forEach(
    function (result) {

      // 漢字表記そのものとの近さ
      const nameScore =
        similarityScore(
          targetName,
          result.normalized
        );


      // 読みとの近さ
      const readingScore =
        similarityScore(
          targetReading,
          result.reading
        );


      const score =
        Math.max(
          nameScore,
          readingScore
        );


      if (
        score > bestScore
      ) {

        bestScore =
          score;


        bestResult =
          result;

      }

    }
  );


  // ======================================================
  // おしい
  // ======================================================

  if (
    bestResult
    &&
    bestScore >= 0.65
  ) {

    statusElement.textContent =
      "🙂 おしい！「"
      +
      bestResult.original
      +
      "」と聞こえました。もう一回やってみよう。";


    statusElement.classList.add(
      "near"
    );


    return;

  }


  // ======================================================
  // 不正解
  // ======================================================

  const firstResult =
    checkedResults[0];


  if (
    firstResult
  ) {

    statusElement.textContent =
      "🔁 「"
      +
      firstResult.original
      +
      "」と聞こえました。もう一度ゆっくり言ってみよう。";

  } else {

    statusElement.textContent =
      "🔁 うまく聞き取れませんでした。もう一度やってみよう。";

  }


  statusElement.classList.add(
    "error"
  );

}


// ========================================================
// 正解表示
// ========================================================

function showSuccess(
  statusElement,
  recognizedText,
  reading
) {

  statusElement.textContent =
    "🎉 できた！「"
    +
    recognizedText
    +
    "」と聞こえました。";


  statusElement.classList.add(
    "success"
  );


  console.log(
    "音声認識:",
    recognizedText,
    "読み:",
    reading
  );

}


// ========================================================
// kuromoji読み込み
// ========================================================

function loadKuromoji() {

  // すでに準備済み

  if (
    kuromojiTokenizer
  ) {

    return Promise.resolve(
      kuromojiTokenizer
    );

  }


  // 読み込み中なら同じPromiseを返す

  if (
    kuromojiLoadingPromise
  ) {

    return kuromojiLoadingPromise;

  }


  kuromojiLoadingPromise =
    new Promise(
      function (
        resolve,
        reject
      ) {

        // ----------------------------------------
        // kuromoji.js本体がまだない場合
        // scriptタグを自動追加
        // ----------------------------------------

        if (
          typeof window.kuromoji
          ===
          "undefined"
        ) {

          const script =
            document.createElement(
              "script"
            );


          script.src =
            KUROMOJI_SCRIPT_URL;


          script.async =
            true;


          script.onload =
            function () {

              buildKuromojiTokenizer(
                resolve,
                reject
              );

            };


          script.onerror =
            function () {

              reject(
                new Error(
                  "kuromoji.jsを読み込めませんでした"
                )
              );

            };


          document.head.appendChild(
            script
          );


          return;

        }


        // すでに読み込まれている場合

        buildKuromojiTokenizer(
          resolve,
          reject
        );

      }
    );


  return kuromojiLoadingPromise;

}


// ========================================================
// kuromoji tokenizer作成
// ========================================================

function buildKuromojiTokenizer(
  resolve,
  reject
) {

  if (
    !window.kuromoji
  ) {

    reject(
      new Error(
        "kuromojiが見つかりません"
      )
    );


    return;

  }


  window.kuromoji
    .builder({

      dicPath:
        KUROMOJI_DIC_PATH

    })
    .build(
      function (
        error,
        tokenizer
      ) {

        if (
          error
        ) {

          console.error(
            "kuromoji辞書エラー:",
            error
          );


          reject(
            error
          );


          return;

        }


        kuromojiTokenizer =
          tokenizer;


        console.log(
          "kuromoji準備完了"
        );


        resolve(
          tokenizer
        );

      }
    );

}


// ========================================================
// 漢字 → 読み
// ========================================================

async function convertJapaneseToReading(
  text
) {

  const original =
    String(
      text
    );


  // すでにひらがな・カタカナだけなら
  // kuromojiを使わずそのまま

  if (
    !containsKanji(
      original
    )
  ) {

    return normalizeKana(
      original
    );

  }


  try {

    const tokenizer =
      await loadKuromoji();


    const tokens =
      tokenizer.tokenize(
        original
      );


    let reading = "";


    tokens.forEach(
      function (token) {

        // 辞書に読みがある場合

        if (
          token.reading
          &&
          token.reading !== "*"
        ) {

          reading +=
            token.reading;

        } else {

          // 未知語など
          reading +=
            token.surface_form;

        }

      }
    );


    return normalizeKana(
      reading
    );


  } catch (error) {

    console.warn(
      "読み変換に失敗しました:",
      original,
      error
    );


    // 失敗した場合も
    // 通常の音声判定は続ける

    return normalizeKana(
      original
    );

  }

}


// ========================================================
// 漢字を含むか
// ========================================================

function containsKanji(
  text
) {

  return /[\u3400-\u4DBF\u4E00-\u9FFF々〆ヵヶ]/.test(
    String(
      text
    )
  );

}


// ========================================================
// 音声認識用の文字正規化
// ========================================================

function normalizeSpeechText(
  text
) {

  return normalizeKana(
    String(
      text
    )
      .replace(
        /[、。,.!?！？「」『』（）()【】［］\[\]\-ー\s]/g,
        ""
      )
  );

}


// ========================================================
// ひらがな・カタカナ統一
// ========================================================

function normalizeKana(
  text
) {

  return String(
    text
  )

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


// ========================================================
// 文字列の近さ
// ========================================================

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


// ========================================================
// レーベンシュタイン距離
// ========================================================

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
      {
        length:
          rows
      },

      function () {

        return new Array(
          columns
        ).fill(
          0
        );

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
        left[i - 1]
        ===
        right[j - 1]
          ?
          0
          :
          1;


      matrix[i][j] =
        Math.min(

          matrix[i - 1][j]
          +
          1,

          matrix[i][j - 1]
          +
          1,

          matrix[i - 1][j - 1]
          +
          cost

        );

    }

  }


  return matrix[
    rows - 1
  ][
    columns - 1
  ];

}


// ========================================================
// 発音結果表示をリセット
// ========================================================

function resetPracticeStatus(
  statusElement
) {

  statusElement.className =
    "practice-status";

}


// ========================================================
// 表示するカテゴリを切り替え
// ========================================================

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


// ========================================================
// 検索結果を消す
// ========================================================

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
