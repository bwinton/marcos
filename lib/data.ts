import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface StationData {
  station_name?: string;
  status?: string;
  platforms: {
    [line: string]: {
      [direction: string]: {
        door_side?: string;
        exits?: {
          [exitName: string]: string | number;
        };
      };
    };
  };
}

export interface LineInfo {
  id: string;
  name: string;
}

export interface SystemInfo {
  id: string;
  name: string;
}

// Get all available systems
export function getSystems(): SystemInfo[] {
  const systemsYamlPath = path.join(process.cwd(), "data", "systems", "systems.yaml");
  
  if (fs.existsSync(systemsYamlPath)) {
    try {
      const fileContents = fs.readFileSync(systemsYamlPath, "utf8");
      const data = yaml.load(fileContents) as SystemInfo[];
      if (Array.isArray(data)) {
        return data;
      }
    } catch (error) {
      console.error("Error loading systems.yaml:", error);
    }
  }
  
  // Fallback: read from directory structure
  const systemsPath = path.join(process.cwd(), "data", "systems");
  const systems = fs.readdirSync(systemsPath, { withFileTypes: true });
  
  return systems
    .filter((dirent) => dirent.isDirectory() && dirent.name !== "systems")
    .map((dirent) => ({
      id: dirent.name,
      name: dirent.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    }));
}

// Get lines for a system
export function getLines(systemId: string): LineInfo[] {
  const linesPath = path.join(process.cwd(), "data", "systems", systemId, "lines.yaml");
  
  if (!fs.existsSync(linesPath)) {
    return [];
  }
  
  try {
    const fileContents = fs.readFileSync(linesPath, "utf8");
    const data = yaml.load(fileContents) as string[] | LineInfo[] | null;
    
    if (!data) {
      return [];
    }
    
    if (Array.isArray(data)) {
      // Check if it's the new format (objects with id/name) or old format (strings)
      if (data.length > 0 && typeof data[0] === "object" && "id" in data[0]) {
        return data as LineInfo[];
      }
      // Old format: array of strings
      return data
        .filter((line) => typeof line === "string" && line.trim().length > 0)
        .map((line) => ({
          id: String(line),
          name: String(line),
        }));
    }
    
    return [];
  } catch (error) {
    console.error(`Error loading lines for ${systemId}:`, error);
    return [];
  }
}

// Get all stations for a system
export function getStations(systemId: string): string[] {
  const stationsPath = path.join(process.cwd(), "data", "systems", systemId, "stations");
  
  if (!fs.existsSync(stationsPath)) {
    return [];
  }
  
  const files = fs.readdirSync(stationsPath);
  return files
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => file.replace(".yaml", ""));
}

// Get station data
export function getStationData(systemId: string, stationId: string): StationData | null {
  const stationPath = path.join(
    process.cwd(),
    "data",
    "systems",
    systemId,
    "stations",
    `${stationId}.yaml`
  );
  
  if (!fs.existsSync(stationPath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(stationPath, "utf8");
  const data = yaml.load(fileContents) as StationData;
  
  return data;
}

// Parse carriage/door format (e.g., "4.2" = 4th carriage, 2nd door)
export function parseCarriageDoor(value: string | number): { carriage: number; door: number } | null {
  const str = String(value);
  const parts = str.split(".");
  
  if (parts.length !== 2) {
    return null;
  }
  
  const carriage = parseInt(parts[0], 10);
  const door = parseInt(parts[1], 10);
  
  if (isNaN(carriage) || isNaN(door)) {
    return null;
  }
  
  return { carriage, door };
}

// Get exits for a specific route (from station -> to station)
export function getExitsForRoute(
  systemId: string,
  lineId: string,
  fromStationId: string,
  toStationId: string
): Array<{ exitName: string; carriage: number; door: number; isDummy?: boolean }> {
  const toStationData = getStationData(systemId, toStationId);
  
  if (!toStationData || !toStationData.platforms[lineId]) {
    return [];
  }
  
  const isDummy = toStationData.status === "dummy";
  const exits: Array<{ exitName: string; carriage: number; door: number; isDummy?: boolean }> = [];
  
  // Check all directions for this line
  Object.entries(toStationData.platforms[lineId]).forEach(([direction, platformData]) => {
    if (platformData.exits) {
      Object.entries(platformData.exits).forEach(([exitName, value]) => {
        const parsed = parseCarriageDoor(value);
        if (parsed) {
          exits.push({
            exitName,
            carriage: parsed.carriage,
            door: parsed.door,
            isDummy,
          });
        }
      });
    }
  });
  
  return exits;
}

// Check if station is dummy
export function isStationDummy(systemId: string, stationId: string): boolean {
  const stationData = getStationData(systemId, stationId);
  return stationData?.status === "dummy";
}

