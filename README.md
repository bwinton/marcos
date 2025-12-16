# MARCOS - Metro And Rail Carriage Optimization System

A simple web application to help you find the best carriage and door position for your metro exit.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Station Data Format

Station data is stored as YAML files in `data/systems/[system_id]/stations/[station_id].yaml`. The format is incredibly simple:

### Example: `tottenham_court_road.yaml`

```yaml
station_name: Tottenham Court Road

platforms:
  central:
    eastbound:
      door_side: right
      exits:
        northern: 4.2
        oxford_street_east: 1.2
    westbound:

  northern:
    southbound:
      door_side: right
      exits:
        central: 1.3
        street: 6.3
    northbound:
      door_side: right
      exits:
        central:eastbound: 1.3
        street: 6.3
```

### Format Explanation

- **`station_name`**: The display name of the station (optional)

- **`platforms`**: A dictionary where each key is a line ID (e.g., `central`, `northern`)

  - Each line contains directions (e.g., `eastbound`, `westbound`, `southbound`, `northbound`)
  
  - Each direction can have:
    - **`door_side`**: Which side of the train the doors are on (`left` or `right`)
    - **`exits`**: A dictionary mapping exit names to carriage/door positions

- **Carriage/Door Format**: Values like `4.2` mean:
  - `4` = 4th carriage (counting from the front)
  - `2` = 2nd door (on that carriage)
  
  So `4.2` means "4th carriage, 2nd door"

### Adding New Stations

To add a new station:

1. Create a new YAML file in `data/systems/[system_id]/stations/[station_id].yaml`
2. Use the format shown above
3. Submit a pull request on GitHub!

The station ID should be a lowercase, underscore-separated version of the station name (e.g., `tottenham_court_road` for "Tottenham Court Road").

## Project Structure

- `data/systems/` - Contains metro system data
  - `[system_id]/lines.yaml` - List of line IDs for the system
  - `[system_id]/stations/` - Station YAML files

## Learn More

This project uses:
- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
