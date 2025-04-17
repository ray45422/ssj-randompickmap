export interface MapCheckResult {
  validationResult: ValidationResult;
  topics: MapCheckTopic[];
  passed: boolean;
  details: MapCheckDetails;
  scanType: string;
  scanResult: ScanResult;
}

export interface MapCheckTopic {
  topicName: string;
  result: TopicResult;
}

export interface MapCheckTopicDifficulty extends MapCheckTopic {
  characteristicName: string;
  difficultyName: string;
}

export interface MapCheckTopicMod extends MapCheckTopicDifficulty {
  dependencyName: string;
  actualDependencyType: string;
  acceptableDependencyTypes: string;
}

export interface MapCheckTopicInvalidWalls extends MapCheckTopicDifficulty {
  invalidWalls: MapCheckTopicInvalidWall[];
}

export interface MapCheckTopicInvalidWall {
  beat: number;
  time: string;
  durationInBeats: number;
  duration: string;
}

export interface MapCheckDetails {
  extra: MapCheckDetailsExtra;
  beatMapData: unknown;
  beatMapInfo: unknown;
}

export interface MapCheckDetailsExtra {
  downloadDirectoryPath: string;
  extractDirectoryPath: string;
  mapFileSize: number;
}

export enum ValidationResult {
  Valid = "Valid",
  Invalid = "Invalid",
}

export enum ScanResult {
  Success = "Success",
  Invalid = "Invalid",
}

export enum TopicResult {
  Valid = "Valid",
  Invalid = "Invalid",
}
