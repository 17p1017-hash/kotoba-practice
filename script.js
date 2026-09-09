// ========================================================
// ことば検索 + 発音チェック 完成版
// 普通のことば / ポケモン / モンハン対応
// 漢字認識（朝→あさ、魚→さかな等）は kuromoji.js で読みへ変換
// ========================================================

let words = [];
let pokemon = [];
let monsters = [];

let kuromojiTokenizer = null;
let kuromojiLoadingPromise = null;

const KUROMOJI_SCRIPT_URL =
  "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/build/kuromoji.js";

const KUROMOJI_DIC_PATH =
  "https://cdn.jsdelivr.net/npm/kuromoji@0.1.2/dict/";


// ========================================================
// 音声認識の漢字 → 読み フォールバック
// ========================================================

const SPEECH_READING_FALLBACKS = {
  "朝": "あさ"
};


// ========================================================
// HTML要素
// ========================================================

const soundInput =
  document.getElementById("soundInput");

const wordSearchButton =
  document.getElementById("wordSearchButton");

const pokemonSearchButton =
  document.getElementById("pokemonSearchButton");

const monsterSearchButton =
  document.getElementById("monsterSearchButton");


const wordResultsSection =
  document.getElementById("wordResultsSection");

const pokemonResultsSection =
  document.getElementById("pokemonResultsSection");

const monsterResultsSection =
  document.getElementById("monsterResultsSection");


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


const monsterStartResults =
  document.getElementById("monsterStartResults");

const monsterMiddleResults =
  document.getElementById("monsterMiddleResults");

const monsterEndResults =
  document.getElementById("monsterEndResults");


// ========================================================
// 起動
// ========================================================

loadData();

loadKuromoji().catch((error) => {
  console.warn(
    "kuromojiの事前読み込みに失敗:",
    error
  );
});


// ========================================================
// JSON読み込み
// ========================================================

async function loadJson(path, label) {

  const response =
    await fetch(
      path,
      {
        cache: "no-store"
      }
    );


  if (!response.ok) {

    throw new Error(
      `${label} の取得に失敗しました (HTTP ${response.status})`
    );

  }


  try {

    return await response.json();

  } catch (error) {

    throw new Error(
      `${label} のJSON形式に問題があります: ${error.message}`
    );

  }

}


// ========================================================
// データ読み込み
// ========================================================

async function loadData() {

  try {

    const [
      rawWords,
      rawPokemon,
      rawMonsters
    ] =
      await Promise.all([

        loadJson(
          "./data/words.json",
          "words.json"
        ),

        loadJson(
          "./data/pokemon.json",
          "pokemon.json"
        ),

        loadJson(
          "./data/monsterhunter.json",
          "monsterhunter.json"
        )

      ]);


    if (!Array.isArray(rawWords)) {

      throw new Error(
        "words.json が配列ではありません"
      );

    }


    if (!Array.isArray(rawPokemon)) {

      throw new Error(
        "pokemon.json が配列ではありません"
      );

    }


    if (!Array.isArray(rawMonsters)) {

      throw new Error(
        "monsterhunter.json が配列ではありません"
      );

    }


    words =
      rawWords
        .map(
          normalizeWordData
        )
        .filter(
          (item) => item.name
        );


    pokemon =
      rawPokemon
        .map(
          (item, index) =>
            normalizePokemonData(
              item,
              index
            )
        )
        .filter(
          (item) => item.name
        );


    monsters =
      rawMonsters
        .map(
          normalizeMonsterData
        )
        .filter(
          (item) => item.name
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
      "データ読み込みエラー:",
      error
    );


    alert(
      "ことばデータの読み込みに失敗しました。\n\n" +
      error.message +
      "\n\nGitHubの data フォルダ内のJSONを確認してください。"
    );

  }

}


// ========================================================
// 普通のことばデータ
// ========================================================

function normalizeWordData(item) {

  if (
    typeof item === "string"
  ) {

    return {

      name:
        item,

      reading:
        normalizeKana(item),

      aliases:
        []

    };

  }


  if (
    !item ||
    typeof item !== "object"
  ) {

    return {

      name:
        "",

      reading:
        "",

      aliases:
        []

    };

  }


  const name =
    item.name ||
    item.word ||
    item.label ||
    item.reading ||
    "";


  const reading =
    item.reading ||
    item.kana ||
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
// ポケモンデータ
// ========================================================

function normalizePokemonData(
  item,
  index
) {

  if (
    typeof item === "string"
  ) {

    return {

      number:
        index + 1,

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


  if (
    !item ||
    typeof item !== "object"
  ) {

    return {

      number:
        index + 1,

      name:
        "",

      reading:
        "",

      aliases:
        []

    };

  }


  const name =
    item.name ||
    item.word ||
    "";


  const reading =
    item.reading ||
    item.kana ||
    name;


  return {

    ...item,

    number:
      Number(
        item.number ||
        item.id ||
        index + 1
      ),

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
// モンハンデータ
// ========================================================

function normalizeMonsterData(item) {

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


  if (
    !item ||
    typeof item !== "object"
  ) {

    return {

      name:
        "",

      reading:
        "",

      aliases:
        []

    };

  }


  const name =
    item.name ||
    item.word ||
    "";


  const reading =
    item.reading ||
    item.kana ||
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
// 検索ボタン
// ========================================================

wordSearchButton.addEventListener(
  "click",
  () => {

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


pokemonSearchButton.addEventListener(
  "click",
  () => {

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


monsterSearchButton.addEventListener(
  "click",
  () => {

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


  if (!rawSound) {

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
// 語頭・語中・語尾
// ========================================================

function classifyItems(
  list,
  sound
) {

  const start = [];
  const middle = [];
  const end = [];


  list.forEach(
    (item) => {

      const reading =
        normalizeKana(
          item.reading ||
          item.name ||
          ""
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

      } else if (
        reading.endsWith(
          sound
        )
      ) {

        end.push(
          item
        );

      } else {

        middle.push(
          item
        );

      }

    }
  );


  return {

    start,
    middle,
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
    (wordData) => {

      element.appendChild(
        createPracticeItem(
          wordData
        )
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
    (pokemonData) => {

      const item =
        document.createElement(
          "div"
        );


      item.className =
        "practice-item";


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
    (monsterData) => {

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
        monsterData.slug
          ?
          "https://monsterhunternow.com/ja/monsters/" +
          monsterData.slug
          :
          "#";


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
// 普通の言葉カード
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
    () => {

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
// 音声認識
// ========================================================

function startPronunciationCheck(
  targetData,
  statusElement,
  button
) {

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  resetPracticeStatus(
    statusElement
  );


  if (
    !SpeechRecognition
  ) {

    statusElement.textContent =
      "このブラウザーでは音声認識を使えません。Chromeまたは対応ブラウザーで試してください。";


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


  // ======================================================
  // 発音判定を厳しくする
  //
  // 複数候補の中に正解が混ざっただけで
  // 正解にならないよう、最有力候補1件だけ取得する
  // ======================================================

  recognition.maxAlternatives =
    1;


  button.disabled =
    true;


  button.textContent =
    "🎤 きいています…";


  statusElement.textContent =
    "ことばを1回、はっきり言ってみよう";


  recognition.onresult =
    async (event) => {

      const result =
        event.results[0];


      if (
        !result ||
        !result[0]
      ) {

        statusElement.textContent =
          "うまく聞き取れませんでした。もう一度やってみよう。";


        statusElement.classList.add(
          "error"
        );


        return;

      }


      // 最有力候補だけを使う
      const recognizedText =
        result[0].transcript;


      statusElement.textContent =
        "判定しています…";


      try {

        await showPronunciationResult(
          targetData,
          recognizedText,
          statusElement
        );

      } catch (error) {

        console.error(
          "発音判定エラー:",
          error
        );


        statusElement.textContent =
          "判定中にエラーが起きました。もう一度試してください。";


        statusElement.classList.add(
          "error"
        );

      }

    };


  recognition.onerror =
    (event) => {

      resetPracticeStatus(
        statusElement
      );


      if (
        event.error === "not-allowed" ||
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
    () => {

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
// 最有力候補1件だけで判定
// 正解判定は完全一致のみ
// 類似度は「おしい」の表示だけに使う
// ========================================================

async function showPronunciationResult(
  targetData,
  originalText,
  statusElement
) {

  resetPracticeStatus(
    statusElement
  );


  const targetName =
    normalizeSpeechText(
      targetData.name ||
      ""
    );


  const targetReading =
    normalizeSpeechText(
      targetData.reading ||
      targetData.name ||
      ""
    );


  const targetAliases =
    Array.isArray(
      targetData.aliases
    )
      ?
      targetData.aliases
      :
      [];


  const acceptableDirect =
    new Set([
      targetName,
      targetReading
    ]);


  targetAliases.forEach(
    (alias) => {

      acceptableDirect.add(
        normalizeSpeechText(
          alias
        )
      );

    }
  );


  const normalizedText =
    normalizeSpeechText(
      originalText
    );


  const convertedReading =
    await convertJapaneseToReading(
      originalText
    );


  const normalizedReading =
    normalizeSpeechText(
      convertedReading
    );


  console.log(
    "最有力の音声認識結果:",
    originalText
  );


  console.log(
    "正規化後:",
    normalizedText
  );


  console.log(
    "読み変換後:",
    normalizedReading
  );


  // ======================================================
  // 正解判定 1
  // 表記そのものの完全一致
  // ======================================================

  if (
    acceptableDirect.has(
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


  // ======================================================
  // 正解判定 2
  // 漢字 → 読み変換後の完全一致
  // ======================================================

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


  // ======================================================
  // aliases の読みも完全一致だけ正解
  // ======================================================

  for (
    const alias
    of targetAliases
  ) {

    const aliasReading =
      normalizeSpeechText(
        await convertJapaneseToReading(
          alias
        )
      );


    if (
      normalizedReading
      ===
      aliasReading
    ) {

      showSuccess(
        statusElement,
        originalText,
        normalizedReading
      );


      return;

    }

  }


  // ======================================================
  // ここから下は不正解
  //
  // 類似度が高くても正解にはしない
  // 「おしい！」の表示にだけ使う
  // ======================================================

  let bestScore =
    Math.max(

      similarityScore(
        targetName,
        normalizedText
      ),

      similarityScore(
        targetReading,
        normalizedReading
      )

    );


  for (
    const alias
    of targetAliases
  ) {

    const normalizedAlias =
      normalizeSpeechText(
        alias
      );


    const aliasReading =
      normalizeSpeechText(
        await convertJapaneseToReading(
          alias
        )
      );


    bestScore =
      Math.max(

        bestScore,

        similarityScore(
          normalizedAlias,
          normalizedText
        ),

        similarityScore(
          aliasReading,
          normalizedReading
        )

      );

  }


  // ======================================================
  // 似ている場合
  //
  // 例:
  // ゼニガメ → ゼリガメ
  // ゼニガメ → ゼニダメ
  //
  // 正解にはせず「おしい」
  // ======================================================

  if (
    bestScore >= 0.65
  ) {

    statusElement.textContent =
      `🙂 おしい！「${originalText}」と聞こえました。もう一回やってみよう。`;


    statusElement.classList.add(
      "near"
    );


    return;

  }


  // ======================================================
  // 大きく違う場合
  // ======================================================

  statusElement.textContent =
    `🔁 「${originalText}」と聞こえました。もう一度ゆっくり言ってみよう。`;


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
    `🎉 できた！「${recognizedText}」と聞こえました。`;


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
// kuromoji.js 読み込み
// ========================================================

function loadKuromoji() {

  if (
    kuromojiTokenizer
  ) {

    return Promise.resolve(
      kuromojiTokenizer
    );

  }


  if (
    kuromojiLoadingPromise
  ) {

    return kuromojiLoadingPromise;

  }


  kuromojiLoadingPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {

        const build =
          () => {

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
                (
                  error,
                  tokenizer
                ) => {

                  if (
                    error
                  ) {

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

          };


        if (
          window.kuromoji
        ) {

          build();


          return;

        }


        const existing =
          document.querySelector(
            `script[src="${KUROMOJI_SCRIPT_URL}"]`
          );


        if (
          existing
        ) {

          existing.addEventListener(
            "load",
            build,
            {
              once:
                true
            }
          );


          existing.addEventListener(
            "error",
            () =>
              reject(
                new Error(
                  "kuromoji.jsを読み込めませんでした"
                )
              ),
            {
              once:
                true
            }
          );


          return;

        }


        const script =
          document.createElement(
            "script"
          );


        script.src =
          KUROMOJI_SCRIPT_URL;


        script.async =
          true;


        script.onload =
          build;


        script.onerror =
          () => {

            reject(
              new Error(
                "kuromoji.jsを読み込めませんでした"
              )
            );

          };


        document.head.appendChild(
          script
        );

      }
    );


  kuromojiLoadingPromise
    .catch(
      () => {

        kuromojiLoadingPromise =
          null;

      }
    );


  return kuromojiLoadingPromise;

}


// ========================================================
// 漢字 → かな読み
// ========================================================

async function convertJapaneseToReading(
  text
) {

  const original =
    String(
      text ||
      ""
    );


  if (
    !containsKanji(
      original
    )
  ) {

    return normalizeKana(
      original
    );

  }


  if (
    Object.prototype.hasOwnProperty.call(
      SPEECH_READING_FALLBACKS,
      original
    )
  ) {

    return normalizeKana(
      SPEECH_READING_FALLBACKS[
        original
      ]
    );

  }


  try {

    const tokenizer =
      await loadKuromoji();


    const tokens =
      tokenizer.tokenize(
        original
      );


    let reading =
      "";


    tokens.forEach(
      (token) => {

        if (
          token.reading &&
          token.reading !== "*"
        ) {

          reading +=
            token.reading;

        } else {

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
      "漢字の読み変換に失敗:",
      original,
      error
    );


    if (
      Object.prototype.hasOwnProperty.call(
        SPEECH_READING_FALLBACKS,
        original
      )
    ) {

      return normalizeKana(
        SPEECH_READING_FALLBACKS[
          original
        ]
      );

    }


    return normalizeKana(
      original
    );

  }

}


// ========================================================
// 漢字判定
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
// 音声認識結果の正規化
// ========================================================

function normalizeSpeechText(
  text
) {

  return normalizeKana(
    String(
      text ||
      ""
    )
      .replace(
        /[、。,.!?！？「」『』（）()【】［］\[\]・:：\-\s♀♂]/g,
        ""
      )
  );

}


// ========================================================
// カタカナ → ひらがな
// ========================================================

function normalizeKana(
  text
) {

  return String(
    text ||
    ""
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
      (match) =>
        String.fromCharCode(
          match.charCodeAt(0)
          -
          0x60
        )
    );

}


// ========================================================
// 類似度
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
      () =>
        new Array(
          columns
        ).fill(
          0
        )
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
// 発音結果リセット
// ========================================================

function resetPracticeStatus(
  statusElement
) {

  statusElement.className =
    "practice-status";

}


// ========================================================
// 表示するカテゴリ
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
// 結果クリア
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
