const words = [
  "あひる", "あめ", "あり", "あさ", "あか",
  "いぬ", "いす", "いちご", "いえ", "いと",
  "うさぎ", "うみ", "うし", "うで", "うた",
  "えんぴつ", "えほん", "えき", "えだ", "えび",
  "おにぎり", "おかし", "おちゃ", "おに", "おさら",

  "かさ", "かめ", "かばん", "かに", "かお",
  "きつね", "きりん", "きのこ", "きしゃ", "き",
  "くつ", "くま", "くるま", "くし", "くり",
  "けむり", "けしごむ", "けんだま", "けいと", "けーき",
  "こま", "こいぬ", "こおり", "ことり", "こえ",

  "さかな", "さる", "さら", "さくら", "さとう",
  "しか", "しお", "しろ", "しま", "しんごう",
  "すいか", "すし", "すな", "すずめ", "すべりだい",
  "せみ", "せんせい", "せなか", "せっけん", "せかい",
  "そら", "そうじ", "そば", "そり", "そで",

  "たこ", "たいこ", "たまご", "たぬき", "たいや",
  "ちず", "ちくわ", "ちょうちょ", "ちから", "ちりがみ",
  "つき", "つくえ", "つみき", "つばめ", "つの",
  "て", "てぶくろ", "てがみ", "てんとうむし", "てれび",
  "とけい", "とり", "とまと", "とら", "とんぼ",

  "なす", "なわ", "なべ", "なみ", "なまえ",
  "にく", "にわとり", "にじ", "にんじん", "にんぎょう",
  "ぬの", "ぬりえ", "ぬま",
  "ねこ", "ねずみ", "ねぎ", "ねんど",
  "のり", "のみもの", "のこぎり", "のはら",

  "はさみ", "はな", "はし", "はこ", "はっぱ",
  "ひつじ", "ひこうき", "ひまわり", "ひよこ", "ひる",
  "ふね", "ふうせん", "ふく", "ふで", "ふとん",
  "へび", "へや", "へいわ",
  "ほし", "ほん", "ほうき", "ほね", "ほたる",

  "まめ", "まど", "まくら", "まつり", "まる",
  "みかん", "みず", "みみ", "みち", "みどり",
  "むし", "むぎ", "むら", "むね",
  "めがね", "めだか", "め", "めろん",
  "もも", "もり", "もち", "ものさし", "もぐら",

  "やま", "やさい", "やぎ", "やかん",
  "ゆき", "ゆび", "ゆめ", "ゆり",
  "よる", "よこ", "ようふく", "よっと",

  "らいおん", "らっぱ", "らくだ",
  "りんご", "りす", "りぼん",
  "るすばん",
  "れもん", "れいぞうこ",
  "ろうそく", "ろぼっと",

  "わに", "わなげ", "わゴム",
  "を",

  "ん"
];

const soundInput = document.getElementById("soundInput");
const searchButton = document.getElementById("searchButton");

const startResults = document.getElementById("startResults");
const middleResults = document.getElementById("middleResults");
const endResults = document.getElementById("endResults");

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
    alert("音を入力してください");
    return;
  }

  const sound = normalizeKana(rawSound);

  const start = [];
  const middle = [];
  const end = [];

  words.forEach(function (word) {
    const normalizedWord = normalizeKana(word);

    if (!normalizedWord.includes(sound)) {
      return;
    }

    if (normalizedWord.startsWith(sound)) {
      start.push(word);
    }

    if (
      normalizedWord.includes(sound) &&
      !normalizedWord.startsWith(sound) &&
      !normalizedWord.endsWith(sound)
    ) {
      middle.push(word);
    }

    if (
      normalizedWord.endsWith(sound) &&
      !normalizedWord.startsWith(sound)
    ) {
      end.push(word);
    }
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

  results.forEach(function (word) {
    const p = document.createElement("p");
    p.textContent = word;
    element.appendChild(p);
  });
}

function normalizeKana(text) {
  return text
    .normalize("NFKC")
    .replace(/[\u30a1-\u30f6]/g, function (match) {
      return String.fromCharCode(match.charCodeAt(0) - 0x60);
    });
}
