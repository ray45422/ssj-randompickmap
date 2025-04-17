export interface Difficulty {
  njs: number;
  offset: number;
  notes: number;
  bombs: number;
  obstacles: number;
  nps: number;
  length: number;
  characteristic: string;
  difficulty: string;
  events: number;
  chroma: boolean;
  me: boolean;
  ne: boolean;
  cinema: boolean;
  vivify?: boolean;
  seconds: boolean;
  paritySummary: unknown;
  maxScore: number;
  environment: string;
}

export interface MapVersion {
  hash: string;
  state: string;
  createdAt: string;
  sageScore: number;
  diffs: Difficulty[];
  downloadURL: string;
  coverURL: string;
  previewURL: string;
}

export interface BeatMapMetadata {
  bpm: unknown;
  duration: number;
  levelAuthorName: string;
  songAuthorName: string;
  songName: string;
  songSubName: string;
}

export interface BeatMapUploader {
  id: number;
  name: string;
  hash: string;
  avatar: string;
  type: string;
  admin: boolean;
  curator: boolean;
  seniorCurator: boolean;
  verifiedMapper: boolean;
  playlistUrl: string;
}

export interface BeatMap {
  id: string;
  name: string;
  description?: string;
  uploader?: BeatMapUploader;
  metadata?: BeatMapMetadata;
  stats?: unknown;
  uploaded: string;
  automapper: boolean;
  ranked: boolean;
  qualiffied: boolean;
  versions: MapVersion[];
  createdAt: string;
  updatedAt: string;
  lastPublishedAt: string;
  tags: string[];
  bookmarked: boolean;
  declaredAi: string;
  blRanked: boolean;
  blQualified: boolean;
  nsfw?: boolean;
}

const exp = {
  API_URL: "https://api.beatsaver.com",
  URL: "https://beatsaver.com",
};

export default exp;
