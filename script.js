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
  "./vendor/kuromoji/kuromoji.js";
const KUROMOJI_DIC_PATH =
  "./vendor/kuromoji/dict/";
// ========================================================
// 音声認識の漢字 → 読み フォールバック
// ========================================================
const SPEECH_READING_FALLBACKS = {
  "雨": "あめ",
  "飴": "あめ",
  "蟻": "あり",
  "朝": "あさ",
  "赤": "あか",
  "犬": "いぬ",
  "椅子": "いす",
  "苺": "いちご",
  "家": "いえ",
  "糸": "いと",
  "海豚": "いるか",
  "兎": "うさぎ",
  "海": "うみ",
  "牛": "うし",
  "腕": "うで",
  "歌": "うた",
  "唄": "うた",
  "饂飩": "うどん",
  "鉛筆": "えんぴつ",
  "絵本": "えほん",
  "駅": "えき",
  "枝": "えだ",
  "海老": "えび",
  "蝦": "えび",
  "お握り": "おにぎり",
  "お菓子": "おかし",
  "お茶": "おちゃ",
  "鬼": "おに",
  "お皿": "おさら",
  "お金": "おかね",
  "傘": "かさ",
  "笠": "かさ",
  "亀": "かめ",
  "鞄": "かばん",
  "蟹": "かに",
  "顔": "かお",
  "狐": "きつね",
  "麒麟": "きりん",
  "茸": "きのこ",
  "汽車": "きしゃ",
  "記者": "きしゃ",
  "胡瓜": "きゅうり",
  "靴": "くつ",
  "熊": "くま",
  "車": "くるま",
  "鯨": "くじら",
  "栗": "くり",
  "海月": "くらげ",
  "煙": "けむり",
  "消しゴム": "けしごむ",
  "消しごむ": "けしごむ",
  "剣玉": "けんだま",
  "けん玉": "けんだま",
  "独楽": "こま",
  "子犬": "こいぬ",
  "小犬": "こいぬ",
  "氷": "こおり",
  "小鳥": "ことり",
  "声": "こえ",
  "魚": "さかな",
  "猿": "さる",
  "皿": "さら",
  "桜": "さくら",
  "砂糖": "さとう",
  "佐藤": "さとう",
  "鹿": "しか",
  "塩": "しお",
  "白": "しろ",
  "城": "しろ",
  "島": "しま",
  "縞": "しま",
  "信号": "しんごう",
  "西瓜": "すいか",
  "寿司": "すし",
  "鮨": "すし",
  "砂": "すな",
  "雀": "すずめ",
  "滑り台": "すべりだい",
  "すべり台": "すべりだい",
  "蝉": "せみ",
  "先生": "せんせい",
  "背中": "せなか",
  "石鹸": "せっけん",
  "石けん": "せっけん",
  "空": "そら",
  "掃除": "そうじ",
  "蕎麦": "そば",
  "橇": "そり",
  "蛸": "たこ",
  "凧": "たこ",
  "太鼓": "たいこ",
  "卵": "たまご",
  "玉子": "たまご",
  "狸": "たぬき",
  "太陽": "たいよう",
  "地図": "ちず",
  "地下鉄": "ちかてつ",
  "蝶々": "ちょうちょ",
  "蝶蝶": "ちょうちょ",
  "竹輪": "ちくわ",
  "月": "つき",
  "机": "つくえ",
  "積み木": "つみき",
  "積木": "つみき",
  "燕": "つばめ",
  "釣り": "つり",
  "手": "て",
  "手紙": "てがみ",
  "手袋": "てぶくろ",
  "天道虫": "てんとうむし",
  "てんとう虫": "てんとうむし",
  "時計": "とけい",
  "鳥": "とり",
  "トマト": "とまと",
  "虎": "とら",
  "豆腐": "とうふ",
  "茄子": "なす",
  "縄": "なわ",
  "波": "なみ",
  "鍋": "なべ",
  "鶏": "にわとり",
  "虹": "にじ",
  "肉": "にく",
  "人参": "にんじん",
  "布": "ぬの",
  "塗り絵": "ぬりえ",
  "ぬり絵": "ぬりえ",
  "縫いぐるみ": "ぬいぐるみ",
  "猫": "ねこ",
  "鼠": "ねずみ",
  "葱": "ねぎ",
  "粘土": "ねんど",
  "海苔": "のり",
  "糊": "のり",
  "飲み物": "のみもの",
  "飲物": "のみもの",
  "野原": "のはら",
  "鋏": "はさみ",
  "花": "はな",
  "鼻": "はな",
  "橋": "はし",
  "箸": "はし",
  "箱": "はこ",
  "葉っぱ": "はっぱ",
  "飛行機": "ひこうき",
  "羊": "ひつじ",
  "向日葵": "ひまわり",
  "紐": "ひも",
  "船": "ふね",
  "舟": "ふね",
  "風船": "ふうせん",
  "服": "ふく",
  "福": "ふく",
  "筆": "ふで",
  "布団": "ふとん",
  "蛇": "へび",
  "部屋": "へや",
  "星": "ほし",
  "本": "ほん",
  "箒": "ほうき",
  "蛍": "ほたる",
  "豆": "まめ",
  "枕": "まくら",
  "窓": "まど",
  "祭り": "まつり",
  "蜜柑": "みかん",
  "水": "みず",
  "耳": "みみ",
  "味噌": "みそ",
  "虫": "むし",
  "麦": "むぎ",
  "結び": "むすび",
  "村": "むら",
  "眼鏡": "めがね",
  "目高": "めだか",
  "麺": "めん",
  "餅": "もち",
  "桃": "もも",
  "森": "もり",
  "物差し": "ものさし",
  "物差": "ものさし",
  "山": "やま",
  "野菜": "やさい",
  "山羊": "やぎ",
  "薬缶": "やかん",
  "雪": "ゆき",
  "指": "ゆび",
  "床": "ゆか",
  "夢": "ゆめ",
  "夜": "よる",
  "洋服": "ようふく",
  "横": "よこ",
  "駱駝": "らくだ",
  "拉麺": "らーめん",
  "栗鼠": "りす",
  "林檎": "りんご",
  "留守番": "るすばん",
  "冷蔵庫": "れいぞうこ",
  "蝋燭": "ろうそく",
  "ろう燭": "ろうそく",
  "鰐": "わに",
  "綿": "わた",
  "輪ゴム": "わごむ",
  "輪ごむ": "わごむ",
  "輪投げ": "わなげ",
  "勝負": "しょうぶ",
  "菖蒲": "しょうぶ"
};
const LOCAL_READINGS = new Map(Object.entries(SPEECH_READING_FALLBACKS).map(([key, value]) => [normalizeSpeechText(key), value]));
// 部分的な漢字変換にも対応。読みが確認できる部分だけを照合する。
const EXTRA_PART_READINGS = {
  "亀": ["がめ"], "種": ["たね", "だね"], "花": ["はな", "ばな"],
  "蜥蜴": ["とかげ"], "影": ["かげ"], "銭": ["ぜに"],
  "鳥": ["とり", "どり"], "虫": ["むし"], "竜": ["りゅう"],
  "龍": ["りゅう"], "丸": ["まる"], "炎": ["ほのお", "えん"],
  "雷": ["かみなり", "らい"], "氷": ["こおり", "ひょう"],
  "岩": ["いわ", "がん"], "草": ["くさ", "ぐさ", "そう"],
  "水": ["みず", "すい"], "火": ["ひ", "か"], "牙": ["きば", "が"],
  "角": ["つの", "かく"], "尾": ["お", "び"], "山": ["やま", "さん"],
  "熊": ["くま", "ぐま"], "狐": ["きつね", "ぎつね"], "猿": ["さる", "ざる"],
  "蛇": ["へび", "じゃ"], "魚": ["さかな", "うお", "ぎょ"],
  "貝": ["かい", "がい"], "蟹": ["かに", "がに"], "蜂": ["はち", "ばち"],
  "猫": ["ねこ"], "犬": ["いぬ"], "雪": ["ゆき", "せつ"], "月": ["つき", "げつ"],
  "星": ["ほし", "ぼし", "せい"], "鬼": ["おに", "き"], "王": ["おう"],
  "剣": ["けん", "つるぎ"], "盾": ["たて"], "玉": ["たま", "だま"],
  "風": ["かぜ", "ふう"], "空": ["そら", "くう"], "音": ["おと", "おん"],
  "石": ["いし", "せき"], "毒": ["どく"], "夢": ["ゆめ"], "森": ["もり"],
  "骨": ["ほね", "ぼね"], "金": ["きん", "かね", "がね"], "銀": ["ぎん"],
  "黒": ["くろ", "ぐろ"], "白": ["しろ", "じろ"], "赤": ["あか"], "青": ["あお"]
};
const PART_READINGS = new Map();
for (const [surface, readings] of [...LOCAL_READINGS].map(([k,v]) => [k,[v]]).concat(Object.entries(EXTRA_PART_READINGS))) {
  const key = normalizeSpeechText(surface);
  if (!containsKanji(key)) continue;
  const values = PART_READINGS.get(key) || new Set();
  for (const r of readings) values.add(normalizeSpeechText(r));
  PART_READINGS.set(key, values);
}
function matchesPartialReading(surface, target) {
  if (!containsKanji(surface) || !target || containsKanji(target)) return false;
  const memo = new Map();
  function visit(i,j) {
    if (i === surface.length) return j === target.length;
    if (j >= target.length) return false;
    const key = i + ':' + j;
    if (memo.has(key)) return memo.get(key);
    let ok = !containsKanji(surface[i]) && surface[i] === target[j] && visit(i+1,j+1);
    if (!ok) for (const [part, readings] of PART_READINGS) {
      if (!surface.startsWith(part,i)) continue;
      for (const r of readings) if (target.startsWith(r,j) && visit(i+part.length,j+r.length)) { ok = true; break; }
      if (ok) break;
    }
    memo.set(key,ok);
    return ok;
  }
  return visit(0,0);
}

// ========================================================
// HTML要素
// ========================================================
const soundInput =
  document.getElementById("soundInput");
// ユーザーのタップ処理内で直接フォーカスする。
// 非同期処理に移さず、標準の入力・日本語変換はそのまま利用する。
function focusSoundInput() {
  if (document.activeElement !== soundInput) {
    soundInput.focus();
  }
}
soundInput.addEventListener("click", focusSoundInput);
let inputTouchStart = null;
soundInput.addEventListener("touchstart", (event) => {
  const touch = event.touches.length === 1 ? event.touches[0] : null;
  inputTouchStart = touch
    ? { x: touch.clientX, y: touch.clientY }
    : null;
}, { passive: true });
soundInput.addEventListener("touchend", (event) => {
  const start = inputTouchStart;
  inputTouchStart = null;
  const touch = event.changedTouches[0];
  if (!start || !touch || event.touches.length !== 0) return;
  // スクロールやスワイプではキーボードを開かない。
  if (Math.hypot(touch.clientX - start.x, touch.clientY - start.y) > 10) return;
  focusSoundInput();
}, { passive: true });
soundInput.addEventListener("touchcancel", () => {
  inputTouchStart = null;
}, { passive: true });
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
// 辞書を事前読み込みし、初回の判定待ちを短縮する。
loadKuromoji().catch(error => console.warn("読み辞書の準備に失敗:", error));
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
  if (acceptableDirect.has(normalizedText)) {
    showSuccess(statusElement, originalText, targetReading);
    return;
  }
  for (const candidate of acceptableDirect) {
    if (matchesPartialReading(normalizedText, candidate)) {
      showSuccess(statusElement, originalText, candidate);
      return;
    }
  }
  const convertedReading =
    await convertJapaneseToReading(
      originalText
    );
  // 音声認識は漢字を返すことがあるため、比較前に読みを確定する。
  // お題の表記と完全一致する場合は、辞書の多義読みよりお題の読みを優先。
  const normalizedReading =
    normalizedText === targetName && targetReading && !containsKanji(targetReading)
      ? targetReading
      : normalizeSpeechText(convertedReading);
  // 辞書にない漢字を無理に不正解扱いしない。
  if (containsKanji(normalizedReading)) {
    statusElement.textContent =
      `🎤「${originalText}」と聞こえましたが、漢字の読みを確認できませんでした。もう一度試してください。`;
    statusElement.classList.add("near");
    return;
  }
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
    normalizeSpeechText(text);
  if (
    !containsKanji(
      original
    )
  ) {
    return normalizeKana(
      original
    );
  }
  if (LOCAL_READINGS.has(original)) {
    return normalizeKana(
      LOCAL_READINGS.get(original)
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
