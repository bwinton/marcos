// #!/usr/bin/env node

// const https = require("https");
// const fs = require("fs");

// const targetUrl = new URL(
//   "https://en.wikipedia.org/wiki/List_of_New_York_City_Subway_stations"
// );

// const options = {
//   hostname: targetUrl.hostname,
//   path: targetUrl.pathname + targetUrl.search,
//   headers: {
//     "User-Agent":
//       "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
//   },
// };

// https
//   .get(options, (res) => {
//     let data = "";

//     res.on("data", (chunk) => {
//       data += chunk;
//     });

//     res.on("end", () => {
//       // Check if we got HTML content
//       if (!data.includes("<table")) {
//         console.error("No table tags found in response");
//         console.error("Response length:", data.length);
//         console.error("First 1000 chars:", data.substring(0, 1000));
//         process.exit(1);
//       }

//       // Find the "List of stations" heading and get the table after it
//       // Look for the heading, then find the next table
//       const headingMatch = data.match(
//         /<h[23][^>]*id="[^"]*"[^>]*>[\s\S]*?List of stations[\s\S]*?<\/h[23]>/i
//       );

//       let searchStart = 0;
//       if (headingMatch) {
//         searchStart = headingMatch.index + headingMatch[0].length;
//         console.log('Found "List of stations" heading');
//       }

//       // Find tables - use a more robust approach
//       // Look for table opening tag and match until the closing tag (handling nested tables)
//       const tablePattern =
//         /<table[^>]*class="[^"]*wikitable[^"]*sortable[^"]*"[^>]*>([\s\S]*?)<\/table>/g;
//       let tableMatches = [];
//       let match;

//       while (
//         (match = tablePattern.exec(data.substring(searchStart))) !== null
//       ) {
//         tableMatches.push(match);
//       }

//       // If no wikitable sortable, try just wikitable
//       if (tableMatches.length === 0) {
//         const wikitablePattern =
//           /<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/g;
//         while (
//           (match = wikitablePattern.exec(data.substring(searchStart))) !== null
//         ) {
//           tableMatches.push(match);
//         }
//       }

//       // If still none, try any table
//       if (tableMatches.length === 0) {
//         const anyTablePattern = /<table[^>]*>([\s\S]*?)<\/table>/g;
//         while (
//           (match = anyTablePattern.exec(data.substring(searchStart))) !== null
//         ) {
//           tableMatches.push(match);
//         }
//       }

//       if (tableMatches.length === 0) {
//         console.error("Could not find any tables");
//         console.error("Search started at position:", searchStart);
//         console.error("Data length:", data.length);
//         process.exit(1);
//       }

//       console.log(`Found ${tableMatches.length} table(s)`);

//       // Find the table with the most rows (should be the main stations table)
//       let maxRows = 0;
//       let bestTable = null;

//       for (const tableMatch of tableMatches) {
//         const tableHtml = tableMatch[1];
//         const rowCount = (tableHtml.match(/<tr/g) || []).length;
//         console.log(`Table has ${rowCount} rows`);
//         if (rowCount > maxRows) {
//           maxRows = rowCount;
//           bestTable = tableHtml;
//         }
//       }

//       if (!bestTable || maxRows < 100) {
//         console.error(
//           `Could not find stations table with sufficient rows (found ${maxRows} rows)`
//         );
//         process.exit(1);
//       }

//       console.log(`Using table with ${maxRows} rows`);
//       extractStations(bestTable);

//       function extractStations(tableHtml) {
//         const stations = []; // Keep all entries, don't remove duplicates

//         // Extract all table rows (tr tags)
//         const rowMatches = Array.from(
//           tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)
//         );

//         for (const rowMatch of rowMatches) {
//           const rowHtml = rowMatch[1];

//           // Skip header rows (th tags)
//           if (rowHtml.includes("<th")) {
//             continue;
//           }

//           // Extract table cells (td tags)
//           const cellMatches = Array.from(
//             rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)
//           );

//           // Some rows might have fewer cells (like merged cells or special formatting)
//           // Try to get at least the first cell (station name)
//           if (cellMatches.length < 1) {
//             continue;
//           }

//           // If no second cell, use empty string for services
//           const hasServices = cellMatches.length >= 2;

//           // The station name is in the first cell
//           const firstCell = cellMatches[0][1];
//           // The services are in the second cell (if it exists)
//           const secondCell = hasServices ? cellMatches[1][1] : "";

//           // Extract station name
//           let stationName = "";
//           const linkMatch = firstCell.match(
//             /<a[^>]*href="\/wiki\/[^"]*"[^>]*>([^<]+)<\/a>/
//           );
//           if (linkMatch) {
//             stationName = linkMatch[1];
//           } else {
//             stationName = firstCell.replace(/<[^>]+>/g, "").trim();
//           }

//           // Extract services (second column) - extract line identifiers
//           // Services column contains things like: "L" train, "2" train "5" train, etc.
//           // First extract text from links if present, then fall back to plain text
//           let servicesText = "";

//           // Try to get text from links first (services are often in links)
//           const serviceLinks = secondCell.matchAll(/<a[^>]*>([^<]+)<\/a>/g);
//           const linkTexts = Array.from(serviceLinks).map((m) => m[1]);
//           if (linkTexts.length > 0) {
//             servicesText = linkTexts.join(" ");
//           } else {
//             // If no links, extract all text
//             servicesText = secondCell.replace(/<[^>]+>/g, "").trim();
//           }

//           if (!stationName) {
//             continue;
//           }

//           // Clean up HTML entities for station name
//           stationName = stationName
//             .replace(/&amp;/g, "&")
//             .replace(/&quot;/g, '"')
//             .replace(/&#39;/g, "'")
//             .replace(/&lt;/g, "<")
//             .replace(/&gt;/g, ">")
//             .replace(/&nbsp;/g, " ")
//             .replace(/&#91;/g, "[")
//             .replace(/&#93;/g, "]")
//             .replace(/&#160;/g, " ")
//             .trim();

//           // Clean up HTML entities for services
//           servicesText = servicesText
//             .replace(/&amp;/g, "&")
//             .replace(/&quot;/g, '"')
//             .replace(/&#39;/g, "'")
//             .replace(/&lt;/g, "<")
//             .replace(/&gt;/g, ">")
//             .replace(/&nbsp;/g, " ")
//             .replace(/&#160;/g, " ")
//             .trim();

//           // Skip if it's a header
//           if (
//             stationName.match(
//               /^(Station|Name|Borough|Services|Div|Line|Opened|Neighborhood|Ridership|Rank)$/i
//             )
//           ) {
//             continue;
//           }

//           // Extract line identifiers from services text
//           // Services format: "L" train, "2" train "5" train, shuttle train, etc.
//           const lines = [];

//           // First, try to extract quoted strings (most common format: "L", "2", "5", etc.)
//           const quotedMatches = servicesText.match(/"([^"]+)"/g);
//           if (quotedMatches) {
//             quotedMatches.forEach((match) => {
//               const line = match.replace(/"/g, "").trim();
//               if (line && !lines.includes(line)) {
//                 lines.push(line);
//               }
//             });
//           }

//           // If no quoted strings, try patterns like "1" train or just look for line codes
//           if (lines.length === 0) {
//             // Look for patterns like "X" train or "XX" train
//             const trainPattern = /"([^"]+)"\s+train/gi;
//             let match;
//             while ((match = trainPattern.exec(servicesText)) !== null) {
//               const line = match[1].trim();
//               if (line && !lines.includes(line)) {
//                 lines.push(line);
//               }
//             }
//           }

//           // If still no lines, check for shuttle or express
//           if (lines.length === 0) {
//             if (servicesText.toLowerCase().includes("shuttle")) {
//               lines.push("shuttle");
//             } else if (servicesText.toLowerCase().includes("express")) {
//               lines.push("express");
//             } else {
//               // Try to extract any single letter or number codes (A-Z, 0-9, 1-2 digits)
//               const codeMatches = servicesText.match(/\b([A-Z0-9]{1,2})\b/g);
//               if (codeMatches) {
//                 codeMatches.forEach((code) => {
//                   if (!lines.includes(code)) {
//                     lines.push(code);
//                   }
//                 });
//               }
//             }
//           }

//           // Combine lines into a single string, sorted and joined with underscores
//           let cleanServices = "";
//           if (lines.length > 0) {
//             cleanServices = lines.sort().join("_").toLowerCase();
//           } else if (servicesText) {
//             cleanServices = servicesText
//               .replace(/"/g, "")
//               .replace(/\s+/g, "_")
//               .replace(/[^\w_]/g, "")
//               .toLowerCase();
//           }

//           // Always append services with underscore, even if empty (for consistency)
//           const combinedName = cleanServices
//             ? `${stationName}_${cleanServices}`
//             : `${stationName}_`;

//           stations.push(combinedName);
//         }

//         if (stations.length === 0) {
//           console.error("Could not extract any stations from table");
//           process.exit(1);
//         }

//         // Verify we have 473 items
//         if (stations.length !== 473) {
//           console.warn(
//             `Warning: Expected 473 items, but found ${stations.length} items`
//           );
//         } else {
//           console.log(`✓ Verified: Found exactly 473 items`);
//         }

//         // Format as YAML list
//         const yaml = stations
//           .map((station) => `- ${JSON.stringify(station)}`)
//           .join("\n");

//         // Save to file
//         const outputPath = "./data/systems/nyc_subway/stations.yaml";
//         fs.writeFileSync(outputPath, yaml + "\n", "utf8");

//         console.log(`Successfully extracted ${stations.length} stations`);
//         console.log(`Saved to ${outputPath}`);
//       }
//     });
//   })
//   .on("error", (err) => {
//     console.error("Error fetching Wikipedia page:", err.message);
//     process.exit(1);
//   });
