"use client";
import { useState, useEffect } from "react";
import axios, { AxiosError, AxiosHeaders } from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import "./page.css";
import beatsaver, { BeatMap, Difficulty } from "../beatsaver/api";
import {
  MapCheckResult,
  TopicResult,
  MapCheckTopicInvalidWalls,
  MapCheckTopicMod,
  MapCheckTopicDifficulty,
} from "../yaschecker/api";
import { SpreadsheetValues } from "../spreadsheet/api";

class DifficultyInfo {
  characteristic: string;
  name: string;
  valid: boolean;
  reason: string[];
  info: Difficulty;
  constructor(
    characteristic: string,
    name: string,
    valid: boolean,
    reason: string[],
    info: Difficulty
  ) {
    this.characteristic = characteristic;
    this.name = name;
    this.valid = valid;
    this.reason = reason;
    this.info = info;
  }
}
const characteristicDifficultyMap = new Map<
  string,
  Map<string, DifficultyInfo>
>();

const optionKeys = [
  "minBSR",
  "maxBSR",
  "minDuration",
  "maxDuration",
  "minNPS",
  "maxNPS",
  "minBPM",
  "maxBPM",
  "noodle",
  "me",
  "chroma",
  "cinema",
  "vivify",
  "automapper",
]
const options: Map<string, string> = new Map([
    ["minBSR", "1"],
    ["maxBSR", ""],
    ["minDuration", "30"],
    ["maxDuration", "420"],
    ["minNPS", "0"],
    ["maxNPS", "8"],
    ["minBPM", ""],
    ["maxBPM", ""],
    ["noodle", "2"],
    ["me", "2"],
    ["chroma", "3"],
    ["cinema", "3"],
    ["vivify", "3"],
    ["automapper", "3"],
  ]);

const optionsPresets: Map<string, Map<string, string>> = new Map([
  ["ssj-g1", new Map<string, string>([
    ["minBSR", "1"],
    ["maxBSR", ""],
    ["minDuration", "30"],
    ["maxDuration", "420"],
    ["minNPS", "0"],
    ["maxNPS", ""],
    ["minBPM", ""],
    ["maxBPM", ""],
    ["noodle", "2"],
    ["me", "2"],
    ["chroma", "3"],
    ["cinema", "3"],
    ["vivify", "3"],
    ["automapper", "3"],
  ])],
  ["ssj-g2", new Map<string, string>([
    ["minBSR", "1"],
    ["maxBSR", ""],
    ["minDuration", "30"],
    ["maxDuration", "420"],
    ["minNPS", "0"],
    ["maxNPS", "8"],
    ["minBPM", ""],
    ["maxBPM", ""],
    ["noodle", "2"],
    ["me", "2"],
    ["chroma", "3"],
    ["cinema", "3"],
    ["vivify", "3"],
    ["automapper", "3"],
  ])],
]);

const checkerEndpoints: [string, boolean][] = [];
process.env.checkerEndpoints
  ?.split("|")
  .map(url => url.endsWith("/") ? url.slice(0, -1) : url)
  .forEach((url) => checkerEndpoints.push([url, true]));

const warnMapCheckEndpoint = process.env.warnMapCheckEndpoint?.endsWith("/")
  ? process.env.warnMapCheckEndpoint.slice(0, -1)
  : process.env.warnMapCheckEndpoint;
const tournamentSystemEndpoint = process.env.tournamentSystemEndpoint?.endsWith("/")
  ? process.env.tournamentSystemEndpoint.slice(0, -1)
  : process.env.tournamentSystemEndpoint;

export default function Home() {
  const [hash, setHash] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const mapCache: Map<string, BeatMap> = new Map();
  const [bsr, setBSR] = useState<string>("1");
  const [copyMessage, setCopyMessage] = useState<string>("");
  const [searchMessage, setSearchMessage] = useState<string>("");
  const [beatMap, setBeatMap] = useState<BeatMap>();
  const [characteristicOptions, setCharacteristicOptions] = useState<string[]>(
    []
  );
  const [characteristic, setCharacteristic] = useState<string>("");
  const [difficultyOptions, setDifficultyOptions] = useState<DifficultyInfo[]>(
    []
  );
  const [difficulty, setDifficulty] = useState<string>("");
  const [mapChecking, setMapChecking] = useState<boolean>(false);
  const [mapCheckResult, setMapCheckResult] = useState<MapCheckResult>();
  const [
    mapChckerEndpointInfomationMessages,
    setMapChckerEndpointInfomationMessages,
  ] = useState<string[]>([]);
  const [canPlaylistAdd, setCanPlaylistAdd] = useState<boolean>(false);
  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<string>();
  const [authPass, setAuthPass] = useState<string>();
  const [warningMap, setWarningMap] = useState<boolean>(false);
  const [warningMapper, setWarningMapper] = useState<boolean>(false);
  const [isDebug, setDebug] = useState<boolean>(false);
  const [debugBSR, setDebugBSR] = useState<string>("45c73");
  const [minBSRValue, setMinBSRValue] = useState<string>("");
  const [maxBSRValue, setMaxBSRValue] = useState<string>("");
  const [minDurationValue, setMinDurationValue] = useState<string>("");
  const [maxDurationValue, setMaxDurationValue] = useState<string>("");
  const [minNPSValue, setMinNPSValue] = useState<string>("");
  const [maxNPSValue, setMaxNPSValue] = useState<string>("");
  const [minBPMValue, setMinBPMValue] = useState<string>("");
  const [maxBPMValue, setMaxBPMValue] = useState<string>("");
  const [noodleValue, setNoodleValue] = useState<string>("");
  const [meValue, setMeValue] = useState<string>("");
  const [chromaValue, setChromaValue] = useState<string>("");
  const [cinemaValue, setCinemaValue] = useState<string>("");
  const [vivifyValue, setVivifyValue] = useState<string>("");
  const [automapperValue, setAutomapperValue] = useState<string>("");
  const [forcePlaylistAdd, setForcePlaylistAdd] = useState<boolean>(false);

  useEffect(() => {
    setDifficultyInfo("1");
    setPreset();
    setOptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = true;
    difficultyOptions.filter((v) => v.name == difficulty)
      .map((v) => {
        if (!v.valid) {
          result = false;
        }
      });
    if (!mapCheckResult) {
      result = false;
    } else {
      mapCheckResult?.topics?.filter((v) =>
        "difficultyName" in v
          ? (v as MapCheckTopicDifficulty).characteristicName == characteristic &&
            (v as MapCheckTopicDifficulty).difficultyName == difficulty
          : true
      )?.map((v) => {
        if (v.result !== TopicResult.Valid) {
          result = false;
        }
      });
      if (warningMap) {
        result = false;
      }
      if (warningMapper) {
        result = false;
      }
    }
    setCanPlaylistAdd(result);
  }, [characteristic, difficulty, difficultyOptions, mapCheckResult, warningMap, warningMapper]);

  function setPreset() {
    const searchParams = new URLSearchParams(window.location.search);
    const name = searchParams.get("preset");
    if (!name || !optionsPresets.has(name)) {
      return;
    }
    const preset = optionsPresets.get(name);
    for (let i = 0; i < optionKeys.length; i++) {
      const name = optionKeys[i];
      options.set(name, preset?.get(name) || "");
    }
  }

  function setOptions() {
    setMinBSRValue(options.get("minBSR") || "");
    setMaxBSRValue(options.get("maxBSR") || "");
    setMinDurationValue(options.get("minDuration") || "");
    setMaxDurationValue(options.get("maxDuration") || "");
    setMinNPSValue(options.get("minNPS") || "");
    setMaxNPSValue(options.get("maxNPS") || "");
    setMinBPMValue(options.get("minBPM") || "");
    setMaxBPMValue(options.get("maxBPM") || "");
    setNoodleValue(options.get("noodle") || "1");
    setMeValue(options.get("me") || "1");
    setChromaValue(options.get("chroma") || "1");
    setCinemaValue(options.get("cinema") || "1");
    setVivifyValue(options.get("vivify") || "1");
    setAutomapperValue(options.get("automapper") || "1");
  }

  function sleep(msec: number) {
    return new Promise((resolve) => setTimeout(resolve, msec));
  }

  function copyBSR(bsrOnly: boolean) {
    let text = bsr;
    if (!bsrOnly) {
      text = `!bsr ${text}`;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopyMessage("コピーしました");
        setTimeout(() => {
          setCopyMessage("");
        }, 2000);
      })
      .catch((err) => {
        setCopyMessage("コピーに失敗しました");
        console.error(err);
      });
  }

  async function checkMap() {
    setMapChecking(true);
    const message: string[] = [];
    let checkSuccess = false;
    try {
      const queryParams = new URLSearchParams();
      queryParams.set("key", bsr);
      queryParams.set("characteristic", characteristic);
      queryParams.set("difficulty", difficulty);
      const query = queryParams.toString();
      try {
        await axios.get(`./check?${query}`)
      } catch (e) {
        console.error(e)
      }

      for (let i = 0; i < checkerEndpoints.length; i++) {
        const epi = checkerEndpoints[i];
        if (!epi[1]) {
          //continue;
        }
        const ep = epi[0];
        try {
          const result = await axios.post<MapCheckResult>(
            `${ep}/beatmaps/scanner/scan?${query}`
          );
          checkSuccess = true;
          const invalidMapCheckTopics = result.data.topics
            .filter((t) => !("difficultyName" in t))
            .filter((t) => t.result === TopicResult.Invalid);
          if (invalidMapCheckTopics.length != 0) {
            characteristicDifficultyMap.values().forEach((c) => {
              c.values().forEach((d) => {
                d.valid = false;
              });
            });
          }
          result.data.topics
            .filter((t) => "difficultyName" in t)
            .forEach((t) => {
              const di = characteristicDifficultyMap
                .get((t as MapCheckTopicDifficulty).characteristicName)
                ?.get((t as MapCheckTopicDifficulty).difficultyName);
              if (di) {
                di.valid = di.valid && t.result == TopicResult.Valid;
              }
            });
          setMapCheckResult(result.data);
          if (i != 0) {
            message.push(
              `代替エンドポイント(${ep})が使用されました。最新のチェック項目を満たしていない可能性があります。`
            );
          }
          break;
        } catch (e) {
          if (e instanceof AxiosError) {
            epi[1] = false;
            const ae = e as AxiosError;
            message.push(
              `エンドポイント(${ep})でエラーが発生しました: ${ae.message}`
            );
          } else {
            message.push(`エンドポイント(${ep})でエラーが発生しました`);
          }
        }
      }
    } finally {
      setMapChckerEndpointInfomationMessages(message);
      if (!checkSuccess) {
        setMapChecking(false);
      }
    }
  }

  async function addToPlaylist() {
    setAuthRequired(false);
    const params = {
      id: bsr,
      characteristic: characteristic,
      difficulty: difficulty,
    };
    saveCredential();
    const cred = localStorage.getItem("credential");
    const headers = new AxiosHeaders();
    headers.set("Content-Type", "application/json");
    if (cred) {
      headers.set("Authorization", `Basic ${cred}`);
    }
    const result = axios.post(
      `${tournamentSystemEndpoint}/api/map`,
      JSON.stringify(params),
      {
        headers: headers,
      }
    );
    result
      .then((resp) => {
        console.log(resp);
      })
      .catch((resp) => {
        if (!resp) {
          return;
        }
        if (resp.status == 401) {
          setAuthRequired(true);
          return;
        }
      });
  }

  async function generate() {
    setGenerating(true);
    setSearchMessage("");
    try {
      await mainSearch();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  }

  async function mainSearch() {
    const queryParams = await getSearchQueryParams();

    const modOptions = getModOptions();
    const modNames = ["noodle", "me", "chroma", "cinema", "vivify"];
    for (let i = 0; i < modNames.length; i++) {
      const name = modNames[i];
      const opt = modOptions.get(name);
      if (opt) {
        queryParams.set(name, opt.toString());
        break;
      }
    }

    const queryString = new URLSearchParams(queryParams).toString();
    const searchJson = await search(queryString, 0);
    if (searchJson.info.total == 0) {
      setSearchMessage("条件を満たした譜面がありません");
      return;
    }
    for (let retry = 0; retry < 5; retry++) {
      const randomizedNumber = getRandomNumber(0, searchJson.info.total - 1);
      const page = Math.floor(randomizedNumber / 20);
      console.log("total:", searchJson.info.total);
      console.log("randomized num:", randomizedNumber);
      console.log(`page:${page}\nindex:${randomizedNumber % 20}`);
      const randomizedJsonData = await search(queryString, page);
      const randomizedMapData = randomizedJsonData.docs[
        randomizedNumber % 20
      ] as BeatMap;

      const cdMap = getDifficultyInfo(randomizedMapData);
      const diffs: DifficultyInfo[] = [];
      cdMap.values().forEach((ds) => {
        ds.values()
          .filter((d) => d.valid)
          .forEach((d) => diffs.push(d));
      });

      if (diffs.length === 0) {
        setSearchMessage(`リトライ${retry + 1}`);
        await sleep(500);
        continue;
      }
      const diff = diffs[getRandomNumber(0, diffs.length - 1)];
      setDifficultyInfo(
        randomizedMapData.id,
        cdMap,
        randomizedMapData,
        diff.characteristic,
        diff.name
      );
      return;
    }
    setSearchMessage(
      "リトライ回数内に条件を満たす譜面を見つけられませんでした"
    );
  }

  function getModOptions() {
    const modOptions: Map<string, boolean> = new Map();
    const modNames = ["noodle", "me", "chroma", "cinema", "vivify"];
    for (let i = 0; i < modNames.length; i++) {
      const name = modNames[i];
      const optStr = (options.get(name) ?? "3").trim();
      if (optStr !== undefined && optStr == "3") {
        continue;
      }
      const opt = optStr == "1" ? true : false;
      modOptions.set(name, opt);
    }
    return modOptions;
  }

  function getDifficultyInfo(mapInfo: BeatMap) {
    const minNPS = parseInt(options.get("minNPS") ?? "0");
    const maxNPS = parseInt(options.get("maxNPS") ?? "9007199254740991");
    const cdMap = new Map<string, Map<string, DifficultyInfo>>();
    const modOptions = getModOptions();
    const diffs = mapInfo.versions[0].diffs;
    for (let i = 0; i < diffs.length; i++) {
      const diff = diffs[i];
      const c = diff.characteristic;
      const result = checkDifficulty(diff, minNPS, maxNPS, modOptions);
      const a = cdMap.get(c) ?? new Map<string, DifficultyInfo>();
      a.set(diff.difficulty, result);
      cdMap.set(c, a);
    }
    return cdMap;
  }

  function setCharacteristicDifficultyMap(
    cdMap: Map<string, Map<string, DifficultyInfo>>
  ) {
    characteristicDifficultyMap.clear();
    cdMap.keys().forEach((c) => {
      characteristicDifficultyMap.set(c, cdMap.get(c)!);
    });
  }

  async function setDifficultyInfo(
    bsr: string,
    cdMap: Map<string, Map<string, DifficultyInfo>> | undefined = undefined,
    mapInfo: BeatMap | undefined = undefined,
    ch: string | undefined = undefined,
    df: string | undefined = undefined
  ) {
    setCanPlaylistAdd(false);
    setForcePlaylistAdd(false);
    setMapChecking(false);
    setWarningMap(false);
    setWarningMapper(false);
    setMapChckerEndpointInfomationMessages([]);
    setMapCheckResult(undefined);
    if (mapInfo === undefined) {
      const result = await axios.get<BeatMap>(
        `${beatsaver.API_URL}/maps/id/${bsr}`
      );
      mapInfo = result.data;
    }
    axios
      .get<SpreadsheetValues>(`${warnMapCheckEndpoint}/warning-map.json`)
      .then((resp) => {
        if (resp.data.values[0].find((v) => v.endsWith(`/${bsr}`))) {
          setWarningMap(true);
        }
      });
    axios
      .get<SpreadsheetValues>(`${warnMapCheckEndpoint}/warning-mapper.json`)
      .then((resp) => {
        if (
          resp.data.values[0].find((v) =>
            v.endsWith(`/${mapInfo.uploader?.id}`) || mapInfo.collaborators?.find((vv) => v.endsWith(`/${vv?.id}`))
          )
        ) {
          setWarningMapper(true);
        }
      });
    if (cdMap === undefined) {
      cdMap = getDifficultyInfo(mapInfo);
    }
    setCharacteristicDifficultyMap(cdMap);
    setBeatMap(mapInfo);
    setBSR(bsr);
    setHash(mapInfo.versions[0].hash);
    if (ch === undefined) {
      ch = characteristicDifficultyMap.keys().next().value!;
    }
    setCharacteristic(ch);
    const diffs = characteristicDifficultyMap.get(ch)!.values().toArray();
    if (df === undefined) {
      df = diffs[0].name;
    }
    setDifficulty(df);
    setCharacteristicOptions(Array.from(characteristicDifficultyMap.keys()));
    setDifficultyOptions(
      characteristicDifficultyMap.get(ch)!.values().toArray()
    );
  }

  async function search(query: string, page: number = 0) {
    const searchRequestUrl = `${beatsaver.API_URL}/search/text/${page}?${query}`;
    const result = await axios.get(searchRequestUrl);
    if (result.status !== 200) {
      setSearchMessage("エラーが発生しました");
      throw result;
    }
    const searchJson = result.data;
    return searchJson;
  }

  async function getSearchQueryParams() {
    const queryParams = new URLSearchParams();
    queryParams.set("leaderboard", "All");
    queryParams.set("sortOrder", "Latest");

    const minBSR = options.get("minBSR") ?? "";
    if (minBSR !== "") {
      const fromDate = await changeBsrToDate(minBSR);
      if (fromDate) {
        queryParams.set("from", fromDate);
      }
    }

    const maxBSR = options.get("maxBSR") ?? "";
    if (maxBSR !== "") {
      const toDate = await changeBsrToDate(maxBSR);
      if (toDate) {
        queryParams.set("to", toDate);
      }
    }

    [
      "minDuration",
      "maxDuration",
      "minNPS",
      "maxNPS",
      "minBPM",
      "maxBPM",
    ].forEach((name) => {
      const v = options.get(name);
      if (v !== undefined && v.trim() != "") {
        queryParams.set(name, v);
      }
    });

    const automapper = options.get("automapper") ?? "3";
    if (automapper !== "3") {
      queryParams.set("automapper", automapper === "1" ? "true" : "false");
    }

    return queryParams;
  }

  async function changeBsrToDate(bsrCode: string) {
    let nowBsrCode = bsrCode;

    while (parseInt(nowBsrCode, 16) > 0) {
      let jsonData = mapCache.get(nowBsrCode);
      if (jsonData === undefined) {
        jsonData = (
          await axios.get<BeatMap>(`${beatsaver.API_URL}/maps/id/${nowBsrCode}`)
        ).data;
      }
      if (jsonData) {
        mapCache.set(nowBsrCode, jsonData);
        console.log(`Date: ${jsonData.uploaded} bsr ${nowBsrCode}`);
        return jsonData.uploaded;
      } else {
        console.log("NotExist:", nowBsrCode);
        nowBsrCode = hexSubtract(nowBsrCode, "1");
        await sleep(500);
      }
    }
  }

  function checkDifficulty(
    diff: Difficulty,
    minNPS: number,
    maxNPS: number,
    modOptions: Map<string, boolean>
  ): DifficultyInfo {
    const c = diff.characteristic;
    let valid = true;
    const reason: string[] = [];

    const modMap = new Map<string, keyof Difficulty>();
    modMap.set("noodle", "ne");
    modMap.set("me", "me");
    modMap.set("chroma", "chroma");
    modMap.set("cinema", "cinema");
    modMap.set("vivify", "vivify");
    const keys = modMap.keys().toArray();
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const name: keyof Difficulty = modMap.get(key)!;
      if (!modOptions.has(key)) {
        continue;
      }
      const opt = modOptions.get(key)!;
      const e = (diff[name] || false) as boolean;
      if (opt != e) {
        valid = false;
        reason.push(`${key}が${e ? "含まれる" : "含まれない"}`);
      }
    }

    if (c.toLowerCase().endsWith("degree")) {
      valid = false;
      reason.push("回転");
    }
    if (diff.notes == 0) {
      valid = false;
      reason.push("0ノーツ");
    }
    if (diff.nps < minNPS || diff.nps > maxNPS) {
      valid = false;
      reason.push("NPS制限");
    }
    return new DifficultyInfo(
      diff.characteristic,
      diff.difficulty,
      valid,
      reason,
      diff
    );
  }

  function getRandomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function hexSubtract(hex1: string, hex2: string) {
    const result = parseInt(hex1, 16) - parseInt(hex2, 16);
    return result.toString(16);
  }

  function numberValidateion(value: string) {
    return /^[0-9]*$/.test(value);
  }
  function bsrValidateion(value: string) {
    return /^[a-f0-9]{0,5}$/.test(value);
  }

  function onBSRChanged(e: React.ChangeEvent<HTMLInputElement>, name: string) {
    const v = e.target.value.toLowerCase();
    if (bsrValidateion(v)) {
      options.set(name, v);
    }
    e.target.value = options.get(name) ?? "";
  }

  function onNumberChanged(
    e: React.ChangeEvent<HTMLInputElement>,
    name: string
  ) {
    const v = e.target.value;
    if (numberValidateion(v)) {
      if (v.trim() == "") {
        options.set(name, "");
      } else {
        options.set(name, parseInt(v).toString());
      }
    }
    e.target.value = options.get(name) ?? "";
  }

  function onPDChanged(value: string, name: string) {
    if (numberValidateion(value)) {
      options.set(name, parseInt(value).toString());
    }
  }

  function onCharacteristicChange(value: string) {
    setCharacteristic(value);
    const list = characteristicDifficultyMap.get(value)!.values().toArray();
    setDifficultyOptions(list);
    setDifficulty(list[0].name);
  }
  function onDifficultyChange(value: string) {
    setDifficulty(value);
  }

  function onDebugBSRChanged(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    if (bsrValidateion(v)) {
      setDebugBSR(v);
    }
  }

  function onDebugBSRApply() {
    if (debugBSR == "") {
      return;
    }
    setDebug(true);
    setDifficultyInfo(debugBSR);
  }

  function saveCredential() {
    const cred = btoa(`${authUser}:${authPass}`);
    localStorage.setItem("credential", cred);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[1em] row-start-2 items-center sm:items-start app-main">
        <Accordion
          type="multiple"
          className="setting-panel"
          defaultValue={["settings", "map-info"]}
        >
          <AccordionItem value="settings">
            <AccordionTrigger className="setting-panel-toggle-button">
              設定
            </AccordionTrigger>
            <AccordionContent className="setting-panel-content">
              <div className="input-item">
                <label htmlFor="min-bsr" className="form-label">
                  BSRフィルター
                </label>
                <div className="input-group">
                  <input
                    className="form-control"
                    id="min-bsr"
                    placeholder={"1以上"}
                    onChange={(e) => {
                      setMinBSRValue(e.currentTarget.value);
                      onBSRChanged(e, "minBSR");
                    }}
                    value={minBSRValue}
                  />
                  <span className="input-group-text">~</span>
                  <input
                    className="form-control"
                    id="max-bsr"
                    onChange={(e) => {
                      setMaxBSRValue(e.currentTarget.value);
                      onBSRChanged(e, "maxBSR");
                    }}
                    value={maxBSRValue}
                  />
                </div>
              </div>

              <div className="inputItem">
                <label htmlFor="min-duration" className="form-label">
                  曲の長さ
                </label>
                <div className="input-group">
                  <input
                    className="form-control"
                    id="min-duration"
                    onChange={(e) => {
                      setMinDurationValue(e.currentTarget.value);
                      onNumberChanged(e, "minDuration");
                    }}
                    value={minDurationValue}
                  />
                  <span className="input-group-text">~</span>
                  <input
                    className="form-control"
                    id="max-duration"
                    onChange={(e) => {
                      setMaxDurationValue(e.currentTarget.value);
                      onNumberChanged(e, "maxDuration");
                    }}
                    value={maxDurationValue}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="min-nps" className="form-label">
                  NPS
                </label>
                <div className="input-group">
                  <input
                    className="form-control"
                    id="min-nps"
                    onChange={(e) => {
                      setMinNPSValue(e.currentTarget.value);
                      onNumberChanged(e, "minNPS");
                    }}
                    value={minNPSValue}
                  />
                  <span className="input-group-text">~</span>
                  <input
                    className="form-control"
                    id="max-nps"
                    onChange={(e) => {
                      setMaxNPSValue(e.currentTarget.value);
                      onNumberChanged(e, "maxNPS");
                    }}
                    value={maxNPSValue}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="min-bpm" className="form-label">
                  BPM
                </label>
                <div className="input-group">
                  <input
                    className="form-control"
                    id="min-bpm"
                    onChange={(e) => {
                      setMinBPMValue(e.currentTarget.value);
                      onNumberChanged(e, "minBPM");
                    }}
                    value={minBPMValue}
                  />
                  <span className="input-group-text">~</span>
                  <input
                    className="form-control"
                    id="max-bpm"
                    onChange={(e) => {
                      setMaxBPMValue(e.currentTarget.value);
                      onNumberChanged(e, "maxBPM");
                    }}
                    value={maxBPMValue}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">NoodleExtension</label>
                <Select
                  onValueChange={(v) => {
                    setNoodleValue(v);
                    onPDChanged(v, "noodle");
                  }}
                  value={noodleValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="NoodleExtension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">含む</SelectItem>
                    <SelectItem value="2">含まない</SelectItem>
                    <SelectItem value="3">指定しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">MappingExtension</label>
                <Select
                  onValueChange={(v) => {
                    setMeValue(v);
                    onPDChanged(v, "me");
                  }}
                  value={meValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="MappingExtension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">含む</SelectItem>
                    <SelectItem value="2">含まない</SelectItem>
                    <SelectItem value="3">指定しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">Chroma</label>
                <Select
                  onValueChange={(v) => {
                    setChromaValue(v);
                    onPDChanged(v, "chroma");
                  }}
                  value={chromaValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chroma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">含む</SelectItem>
                    <SelectItem value="2">含まない</SelectItem>
                    <SelectItem value="3">指定しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">Cinema</label>
                <Select
                  onValueChange={(v) => {
                    setCinemaValue(v);
                    onPDChanged(v, "cinema");
                  }}
                  value={cinemaValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cinema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">含む</SelectItem>
                    <SelectItem value="2">含まない</SelectItem>
                    <SelectItem value="3">指定しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">Vivify</label>
                <Select
                  onValueChange={(v) => {
                    setVivifyValue(v);
                    onPDChanged(v, "vivify");
                  }}
                  value={vivifyValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Vivify" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">含む</SelectItem>
                    <SelectItem value="2">含まない</SelectItem>
                    <SelectItem value="3">指定しない</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="form-label">AutoMapper</label>
                <Select
                  onValueChange={(v) => {
                    setAutomapperValue(v);
                    onPDChanged(v, "automapper");
                  }}
                  value={automapperValue}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="AutoMapper" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">含む</SelectItem>
                    <SelectItem value="2">自動生成のみ</SelectItem>
                    <SelectItem value="3">含まない</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
          <div>
            <button
              type="button"
              className="btn btn-primary"
              id="searchBtn"
              onClick={generate}
              disabled={generating}
            >
              生成
            </button>
            <span>{searchMessage}</span>
          </div>
          <AccordionItem value="map-info">
            <AccordionTrigger className="map-info-panel-toggle-button">
              譜面情報
            </AccordionTrigger>
            <AccordionContent className="map-info-panel-content">
              <div className="container-sm mt-4">
                <div>
                  <iframe
                    src={`${beatsaver.URL}/maps/${bsr}/embed`}
                    height="145"
                    loading="lazy"
                    id="beatsaverEmbed"
                    allow="clipboard-write"
                  ></iframe>
                </div>

                <div>
                  <label className="form-label">Hash</label>
                  <input className="form-control" value={hash} readOnly />
                </div>

                <div className="map-action-panel">
                  <div className="map-basic-info">
                    <div>
                      <label className="form-label">Characteristic</label>
                      <Select
                        value={characteristic}
                        onValueChange={onCharacteristicChange}
                        disabled={!isDebug}
                      >
                        <SelectTrigger className="difficulty-pd">
                          <SelectValue placeholder="Characteristic" />
                        </SelectTrigger>
                        <SelectContent>
                          {characteristicOptions.map((c, i) => (
                            <SelectItem key={i} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="form-label">Difficulty</label>
                      <Select
                        value={difficulty}
                        onValueChange={onDifficultyChange}
                        disabled={!isDebug}
                      >
                        <SelectTrigger className="difficulty-pd">
                          <SelectValue placeholder="Difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          {difficultyOptions.map((c, i) => (
                            <SelectItem key={i} value={c.name}>
                              {c.valid ? (
                                <i className="bi bi-check-circle-fill"></i>
                              ) : (
                                <i className="bi bi-exclamation-circle-fill"></i>
                              )}
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="map-actions">
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-info ml-2"
                        id="copy-bsr-only-button"
                        onClick={() => {
                          copyBSR(true);
                        }}
                      >
                        CopyBSROnly
                      </button>
                      <span id="copy-message">{copyMessage}</span>
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-warning"
                        id="check-map-button"
                        onClick={checkMap}
                        disabled={mapChecking}
                      >
                        譜面をチェックする
                      </button>
                    </div>
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-success"
                        id="add-to-playlist-button"
                        onClick={addToPlaylist}
                        disabled={!canPlaylistAdd && !forcePlaylistAdd}
                      >
                        プレイリストに追加
                      </button>
                    </div>
                    {!canPlaylistAdd && <div className="mt-2">
                      <input id="warning-confirmation" type="checkbox" checked={forcePlaylistAdd} onChange={() => setForcePlaylistAdd(!forcePlaylistAdd)}></input>
                      <label htmlFor="warning-confirmation">強制的に追加します</label>
                    </div>}
                  </div>
                </div>

                {authRequired && (
                  <div className="auth-panel">
                    <span className="auth-header-text">認証が必要です</span>
                    <div>
                      <label htmlFor="auth-username">username</label>
                      <input
                        id="auth-username"
                        type="text"
                        className="form-control auth-username-input"
                        value={authUser}
                        onChange={(e) => setAuthUser(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="auth-password">password</label>
                      <input
                        id="auth-password"
                        type="password"
                        className="form-control auth-password-input"
                        value={authPass}
                        onChange={(e) => setAuthPass(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <span id="song-name" className="song-name-text">
                    {beatMap?.metadata?.songName}
                  </span>
                </div>
                {beatMap?.nsfw && (
                  <div className="nsfw-flag">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>NSFW</span>
                  </div>
                )}
                {warningMap && (
                  <div className="warning-flag">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>除外譜面です</span>
                  </div>
                )}
                {warningMapper && (
                  <div className="warning-flag">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>除外マッパーです</span>
                  </div>
                )}
                <div className="difficulty-detail-info">
                  <div>
                    <label
                      htmlFor="map-notes"
                      className="difficulty-detail-label"
                    >
                      note:
                    </label>
                    <span id="map-notes" className="difficulty-detail-value">
                      {
                        characteristicDifficultyMap
                          .get(characteristic)
                          ?.get(difficulty)?.info.notes
                      }
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor="map-bombs"
                      className="difficulty-detail-label"
                    >
                      bomb:
                    </label>
                    <span id="map-bombs" className="difficulty-detail-value">
                      {
                        characteristicDifficultyMap
                          .get(characteristic)
                          ?.get(difficulty)?.info.bombs
                      }
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor="map-walls"
                      className="difficulty-detail-label"
                    >
                      walls:
                    </label>
                    <span id="map-walls" className="difficulty-detail-value">
                      {
                        characteristicDifficultyMap
                          .get(characteristic)
                          ?.get(difficulty)?.info.obstacles
                      }
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor="map-njs"
                      className="difficulty-detail-label"
                    >
                      njs:
                    </label>
                    <span id="map-njs" className="difficulty-detail-value">
                      {
                        characteristicDifficultyMap
                          .get(characteristic)
                          ?.get(difficulty)?.info.njs
                      }
                    </span>
                  </div>
                  <div>
                    <label
                      htmlFor="map-nps"
                      className="difficulty-detail-label"
                    >
                      nps:
                    </label>
                    <span id="map-nps" className="difficulty-detail-value">
                      {
                        characteristicDifficultyMap
                          .get(characteristic)
                          ?.get(difficulty)?.info.nps
                      }
                    </span>
                  </div>
                </div>
                <div>
                  {characteristicDifficultyMap
                    .get(characteristic)
                    ?.get(difficulty)!
                    .reason.map((r, i) => (
                      <div key={i}>
                        <span>{r}</span>
                      </div>
                    ))}
                </div>

                {mapChckerEndpointInfomationMessages.length != 0 && (
                  <div className="map-checker-endpoint-information-message">
                    {mapChckerEndpointInfomationMessages.map((v, i) => (
                      <span
                        className="map-checker-endpoint-information-message-txt"
                        key={i}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                )}
                {mapCheckResult && (
                  <div className="map-checker-result">
                    <label>譜面チェック結果</label>
                    {mapCheckResult.topics
                      .filter((v) =>
                        "difficultyName" in v
                          ? (v as MapCheckTopicDifficulty).characteristicName ==
                              characteristic &&
                            (v as MapCheckTopicDifficulty).difficultyName ==
                              difficulty
                          : true
                      )
                      .map((v, i) => (
                        <div key={i}>
                          {v.result === TopicResult.Valid ? (
                            <i className="bi bi-check-circle-fill"></i>
                          ) : (
                            <i className="bi bi-exclamation-circle-fill"></i>
                          )}
                          <span>
                            {v.topicName}{" "}
                            {(v as MapCheckTopicMod)?.dependencyName}
                          </span>
                          {"invalidWalls" in v &&
                            (v as MapCheckTopicInvalidWalls).invalidWalls.map(
                              (w, i) => (
                                <div key={i}>
                                  <span className="ml-4">{w.time}</span>
                                </div>
                              )
                            )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="debug-panel">
            <AccordionTrigger className="debug-panel-toggle-button">
              デバッグ
            </AccordionTrigger>
            <AccordionContent className="debug-panel-panel-content">
              <div>
                <span>
                  デバッグ用機能です
                  <br />
                  有効化すると任意のbsrの設定や難易度変更ができます
                </span>
              </div>
              <div>
                <label htmlFor="debug-cb" className="form-label">
                  デバッグ
                </label>
                <input
                  id="debug-cb"
                  type="checkbox"
                  checked={isDebug}
                  onChange={(e) => setDebug(e.target.checked)}
                />
              </div>
              <div>
                <input
                  id="bsrDebug"
                  type="text"
                  className="form-control"
                  value={debugBSR}
                  onChange={onDebugBSRChanged}
                />
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={onDebugBSRApply}
                >
                  設定
                </button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    </div>
  );
}
