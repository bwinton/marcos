"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Home() {
  const [selectedSystem, setSelectedSystem] = useState<string>("");
  const [selectedLine, setSelectedLine] = useState<string>("");
  const [selectedFromStation, setSelectedFromStation] = useState<string>("");
  const [selectedToStation, setSelectedToStation] = useState<string>("");
  const [systems, setSystems] = useState<Array<{ id: string; name: string }>>(
    []
  );
  const [lines, setLines] = useState<Array<{ id: string; name: string }>>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [exits, setExits] = useState<
    Array<{
      exitName: string;
      carriage: number;
      door: number;
      isDummy?: boolean;
    }>
  >([]);
  const [isDummyData, setIsDummyData] = useState<boolean>(false);

  // Load systems on mount
  useEffect(() => {
    fetch("/api/systems")
      .then((res) => res.json())
      .then((data) => {
        setSystems(data);

        // Load saved system from localStorage
        const savedSystem = localStorage.getItem("marcos_selected_system");
        if (
          savedSystem &&
          data.find((s: { id: string }) => s.id === savedSystem)
        ) {
          setSelectedSystem(savedSystem);
        }
      })
      .catch((err) => console.error("Failed to load systems:", err));
  }, []);

  // Load lines when system changes
  useEffect(() => {
    if (selectedSystem) {
      fetch(`/api/lines?systemId=${selectedSystem}`)
        .then((res) => res.json())
        .then((data) => {
          setLines(data);
          setSelectedLine("");
          setSelectedFromStation("");
          setSelectedToStation("");
          setExits([]);
        })
        .catch((err) => console.error("Failed to load lines:", err));

      // Save to localStorage
      localStorage.setItem("marcos_selected_system", selectedSystem);
    }
  }, [selectedSystem]);

  // Load stations when system changes
  useEffect(() => {
    if (selectedSystem) {
      fetch(`/api/stations?systemId=${selectedSystem}`)
        .then((res) => res.json())
        .then((data) => {
          setStations(data);
          setSelectedFromStation("");
          setSelectedToStation("");
          setExits([]);
        })
        .catch((err) => console.error("Failed to load stations:", err));
    }
  }, [selectedSystem]);

  // Calculate exits when route is selected
  useEffect(() => {
    const hasCompleteRoute =
      selectedSystem &&
      selectedLine &&
      selectedFromStation &&
      selectedToStation;

    if (!hasCompleteRoute) {
      // Use setTimeout to make setState async and avoid linter warning
      const timeoutId = setTimeout(() => {
        setExits([]);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    let cancelled = false;

    fetch(
      `/api/exits?systemId=${selectedSystem}&lineId=${selectedLine}&fromStationId=${selectedFromStation}&toStationId=${selectedToStation}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setExits(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load exits:", err);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedSystem, selectedLine, selectedFromStation, selectedToStation]);

  const formatStationName = (id: string) => {
    return id.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatTitle = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span key={index}>
        <span className="font-bold underline">{word[0]}</span>
        {word.slice(1)}
        {index < text.split(" ").length - 1 && " "}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* GitHub Corner */}
      <a
        href="https://github.com/louisbarclay/marcos"
        className="github-corner"
        aria-label="View source on GitHub"
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 250 250"
          style={{
            fill: "#000000",
            color: "#ffffff",
            position: "absolute",
            top: 0,
            border: 0,
            right: 0,
          }}
          aria-hidden="true"
        >
          <path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z" />
          <path
            d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2"
            fill="currentColor"
            style={{ transformOrigin: "130px 106px" }}
            className="octo-arm"
          />
          <path
            d="M115.0,115.0 C114.9,115.1 118.7,116.9 119.8,115.2 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.9 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z"
            fill="currentColor"
            className="octo-body"
          />
        </svg>
      </a>

      {/* Main Container with max-width */}
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <header className="border-b-4 border-black">
          <div className="px-6 py-6">
            <div className="w-full mb-6">
              <Image
                src="/marcos.png"
                alt="MARCOS Logo"
                width={1200}
                height={200}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {formatTitle("Metro And Rail Carriage Optimization System")}
            </h1>
            <p className="text-lg font-semibold text-gray-700">
              Which <span className="font-bold underline">carriage door</span>,
              for which <span className="font-bold underline">exit</span>, for
              which <span className="font-bold underline">station</span>?
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-6 py-8">
          <div className="space-y-6">
            {/* System Selection */}
            <div>
              <label className="block text-base font-bold mb-3 text-black">
                Metro System
              </label>
              <Select value={selectedSystem} onValueChange={setSelectedSystem}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a metro system" />
                </SelectTrigger>
                <SelectContent>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Line Selection */}
            {selectedSystem && (
              <div>
                <label className="block text-base font-bold mb-3 text-black">
                  Metro Line
                </label>
                <Select
                  value={selectedLine}
                  onValueChange={setSelectedLine}
                  disabled={lines.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a line" />
                  </SelectTrigger>
                  <SelectContent>
                    {lines.map((line) => (
                      <SelectItem key={line.id} value={line.id}>
                        {line.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Station Selection */}
            {selectedSystem && selectedLine && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-base font-bold mb-3 text-black">
                    Station From
                  </label>
                  <Select
                    value={selectedFromStation}
                    onValueChange={setSelectedFromStation}
                    disabled={stations.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select departure station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {formatStationName(station)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 text-black">
                    Station To
                  </label>
                  <Select
                    value={selectedToStation}
                    onValueChange={setSelectedToStation}
                    disabled={stations.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select destination station" />
                    </SelectTrigger>
                    <SelectContent>
                      {stations.map((station) => (
                        <SelectItem key={station} value={station}>
                          {formatStationName(station)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Dummy Data Warning */}
            {isDummyData && (
              <div className="mt-8 bg-yellow-400 border-4 border-black p-6">
                <p className="text-lg font-bold text-black">
                  ⚠️ Dummy Data Warning
                </p>
                <p className="text-base font-semibold text-black mt-2">
                  This station contains dummy/placeholder data. The carriage and
                  door information may not be accurate.
                </p>
              </div>
            )}

            {/* Results */}
            {exits.length > 0 && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6 text-black border-b-4 border-black pb-2">
                  Exits at {formatStationName(selectedToStation)}
                </h2>
                <div className="space-y-4">
                  {exits.map((exit, index) => (
                    <div
                      key={index}
                      className={`border-4 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                        exit.isDummy ? "opacity-75" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xl font-bold mb-2 text-black">
                            {formatStationName(exit.exitName)}
                            {exit.isDummy && (
                              <span className="ml-2 text-sm font-normal text-gray-600">
                                (dummy)
                              </span>
                            )}
                          </p>
                          <p className="text-base font-semibold text-gray-700">
                            {exit.carriage}
                            {exit.carriage === 1
                              ? "st"
                              : exit.carriage === 2
                              ? "nd"
                              : exit.carriage === 3
                              ? "rd"
                              : "th"}{" "}
                            carriage, {exit.door}
                            {exit.door === 1
                              ? "st"
                              : exit.door === 2
                              ? "nd"
                              : exit.door === 3
                              ? "rd"
                              : "th"}{" "}
                            door
                          </p>
                        </div>
                        <div className="text-4xl font-black text-black bg-yellow-400 px-6 py-4 border-4 border-black">
                          {exit.carriage}.{exit.door}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add More Stations Link */}
            <div className="mt-12 pt-8 border-t-4 border-black text-center">
              <a
                href="https://github.com/louisbarclay/marcos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-black hover:text-yellow-400 underline"
              >
                Station not there yet? Help MARCOS and add it on GitHub!
              </a>
            </div>

            {/* Save & Settings Info */}
            <div className="mt-12 pt-8 border-t-4 border-black">
              <div className="space-y-6">
                <div className="bg-yellow-400 border-4 border-black p-6">
                  <h3 className="text-xl font-bold mb-3 text-black">
                    💾 Save This Page
                  </h3>
                  <p className="text-base font-semibold text-black mb-2">
                    <strong>Mobile:</strong> Add to Home Screen for quick access
                  </p>
                  <ul className="list-none space-y-1 text-sm font-semibold text-black ml-4">
                    <li>
                      • <strong>iOS:</strong> Tap Share → Add to Home Screen
                    </li>
                    <li>
                      • <strong>Android:</strong> Menu → Add to Home Screen /
                      Install App
                    </li>
                  </ul>
                  <p className="text-base font-semibold text-black mt-4 mb-2">
                    <strong>Desktop:</strong> Bookmark this page for easy access
                  </p>
                </div>

                <div className="bg-white border-4 border-black p-6">
                  <h3 className="text-xl font-bold mb-3 text-black">
                    ⚙️ Your Settings
                  </h3>
                  <p className="text-base font-semibold text-black">
                    Your{" "}
                    <span className="font-bold underline">Metro System</span>{" "}
                    choice is automatically saved and will be remembered for
                    your next visit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
