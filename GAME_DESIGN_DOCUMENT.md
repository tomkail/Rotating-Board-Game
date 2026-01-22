# Rotating Board Game - Design Document

## Overview

A strategic board game played on a circular board where players place tiles around the edge, creating a ring. The core mechanic involves players pushing tiles to rotate sections of the board (or the entire board), causing all players to move to new tiles and trigger their effects. Players must balance resource management, tile placement, and strategic rotation to achieve victory.

**Key Innovation**: Instead of moving individual player tokens, players rotate the board itself, affecting all players simultaneously. This creates interesting strategic decisions where players must consider both their own benefit and how their actions affect opponents.

---

## Components

### Physical Components
- **Circular Board**: A circular board with slots/grooves around the edge to hold tiles
- **Tiles**: 14-20 tiles total (varies by player count and game state)
  - Each tile has a unique effect/ability
  - Tiles fit into the circular groove/slot system
- **Player Tokens**: Tokens representing each player's position on the board edge
- **Resources**: Tokens or markers representing various resource types
- **Rotation Points**: Separate currency/tokens for performing rotations
- **Victory Point Markers**: Tokens or trackers for tracking victory points

### Digital Prototype Considerations
- Circular board rendered as a ring of tile slots
- Tile objects with visual representation and effect data
- Player tokens positioned on the board edge
- Resource and rotation point counters/trackers
- Visual feedback for rotation animations

---

## Setup

**Status: TO BE DETERMINED**

The initial board setup needs to be designed. Options under consideration:

1. **Players place tiles during setup** - Taking turns to build the initial board
2. **Random setup** - Tiles placed randomly
3. **Empty board** - Board starts empty, players place tiles during gameplay
4. **Pre-built configuration** - Fixed starting arrangement

**Player Count**: Variable (2-6 players suggested, exact range TBD)

**Initial Resources**: TBD
- Starting rotation points: TBD
- Starting resources: TBD

**Tile Distribution**: TBD
- How many tiles per player at start?
- How are tiles distributed initially?

---

## Core Mechanics

### 1. Tile Pushing and Rotation

**Mechanic**: On their turn, a player pushes a tile in a direction (clockwise or counterclockwise). This push causes a chain reaction:
- The pushed tile moves into the adjacent slot
- If that slot is occupied, that tile is pushed, and so on
- If there are no gaps anywhere in the circle, the entire board rotates as a unit

**Rotation Cost**: 
- Rotating costs rotation points (separate currency from other resources)
- Cost is based on the amount of travel/movement
- After rotation, players gain resources from tiles they land on (separate from rotation cost)

**Preventing Back-and-Forth Rotation**: 
- Game rules will prevent simple back-and-forth rotation
- Specific mechanics TBD (options: increasing costs, cooldowns, momentum systems)

### 2. Tile Placement

**When**: During gameplay (as a turn action)

**How**: TBD
- How do players acquire new tiles? (Draw? Purchase? Earn?)
- Can players place tiles anywhere, or are there restrictions?
- Do placed tiles belong to the player who placed them?

**Tile Ownership**: Mixed system
- Some tiles are owned by players (belong to whoever placed them)
- Some tiles are neutral (effects apply to whoever lands on them)

### 3. Resource Management

**Resource Types**: TBD
- Generic resources or specific types?
- How many different resource types exist?

**Resource Generation**: 
- Players gain resources when they land on tiles after rotation
- Some tiles generate specific resource types

**Resource Usage**:
- Convert resources to victory points (via certain tiles)
- Purchase new tiles (if this mechanic is implemented)
- Other uses TBD

### 4. Rotation Points

**Separate Currency**: Rotation points are distinct from other resources

**Generation**: TBD
- Passive generation?
- Earned from specific tiles?
- Tied to player position or stats?
- Amount drawn might be tied to a stat players can improve

**Usage**: 
- Spent to push/rotate tiles
- Cost increases with amount of movement

### 5. Player Movement

**Player Tokens**: Players exist as tokens positioned on the board edge

**Movement Method**: Players do NOT move themselves directly
- Movement only occurs via board rotation
- Special tile actions can move players ("Move player X tiles in a direction")
- Players are typically stationary - the board moves around them

### 6. Tile Effect Triggers

**Trigger Timing**: Most tiles trigger automatically when players land on them after rotation

**Resolution Order**: TBD
- When multiple players land on tiles simultaneously, what is the order of effect resolution?
- Do all effects resolve before the next action, or is there a specific sequence?

---

## Turn Structure

**Status: TO BE DETERMINED**

The exact turn structure needs to be designed. Possible sequences:

**Option A**: 
1. Place a tile (optional)
2. Push/rotate board
3. Trigger tile effects for all players
4. Other actions?

**Option B**:
1. Push/rotate board
2. Trigger tile effects
3. Place a tile (optional)
4. Other actions?

**Option C**: Multiple actions per turn
- Players can perform various actions: push, place, activate tiles, etc.

**Actions Available on Turn**:
- Push a tile (rotate board) - costs rotation points
- Place a tile on the board - TBD how tiles are acquired
- Draw rotation points - amount TBD (might be tied to stats/position)

---

## Tile Types Reference

The following tile effects have been identified. This list may need refinement:

1. **Resource Generation**
   - Get a resource of a certain type
   - Generate rotation points when drawing

2. **Victory Points**
   - Turn a resource into a victory point

3. **Player Movement**
   - Move player X tiles in a direction

4. **Board Manipulation**
   - Swap any two tiles

5. **Turn Control**
   - Skip to the player's turn
   - Become blocked from taking a turn

6. **Resource Transfer**
   - Give all resources to owner of tile (invasion strategy - move tile into opponent's area)

7. **Unknown Tile Type**
   - **"???"** - This tile type needs to be designed or removed

**Tile Count**: 14-20 tiles total on the board
- Players place approximately 4-8 tiles each (depending on player count and performance)

---

## Victory Conditions

**Status: TO BE DETERMINED**

Victory points are mentioned in the notes, but the exact victory condition is unclear:

- Do players win by reaching a certain number of victory points?
- Is there a point threshold that triggers end game?
- Are there alternative victory conditions?
- How are victory points tracked?

---

## Unresolved Design Questions

This section lists all mechanics and decisions that need to be finalized before prototyping:

### Critical Decisions Needed

1. **Tile Acquisition**
   - How do players get new tiles to place?
   - Draw from deck/bag?
   - Purchase with resources?
   - Earn through gameplay?
   - Fixed set at start?

2. **Turn Structure**
   - Exact sequence of actions per turn
   - What actions are available?
   - Can players perform multiple actions per turn?
   - Order of operations

3. **Victory Condition**
   - How do players win?
   - Victory point threshold?
   - Alternative win conditions?
   - End game trigger?

4. **Initial Setup**
   - How is the board created at game start?
   - Do players place tiles during setup?
   - How many tiles per player initially?
   - Starting resources and rotation points?

5. **Tile Type "???"**
   - What should this tile type be?
   - Wildcard tile?
   - Blank/neutral tile?
   - Remove entirely?
   - Something else?

6. **Prevent Back-Forth Rules**
   - Specific mechanics to prevent simple back-and-forth rotation
   - Increasing rotation costs?
   - Cooldown system?
   - Momentum system?
   - Other approach?

7. **Tile Effect Resolution Order**
   - When multiple players land on tiles simultaneously, what is the order?
   - Clockwise from starting player?
   - Simultaneous resolution?
   - Priority system?

8. **Resource Types**
   - Generic resources or specific types?
   - How many different resource types?
   - Do different resources have different values/uses?

9. **Rotation Resource Generation**
   - How is rotation currency earned?
   - Passive generation each turn?
   - From specific tiles?
   - Tied to player position?
   - Tied to player stats that can be improved?

10. **Territorial Mechanics**
    - How does territorial play work?
    - Are players incentivized to place tiles next to each other?
    - What happens when territories connect?
    - Can players upgrade their tiles?
    - Can players steal/destroy opponent tiles?

11. **Player Count Range**
    - Exact player count range (2-4? 2-6?)
    - How does game scale with different player counts?
    - Tile count adjustments per player count?

---

## Design Notes and Considerations

### Resolved Mechanics

The following mechanics have been clarified through design discussion:

- **Terminology**: "Tokens" and "tiles" refer to the same thing - the pieces placed on the board
- **Rotation Mechanism**: Players push a tile, causing chain reaction; if no gaps exist, entire circle rotates
- **Rotation Cost**: Separate from resource generation - players pay rotation points to rotate, then gain resources from tiles they land on
- **Rotation Resource**: Separate currency/points system for rotation (distinct from other resources)
- **Tile Triggers**: Most tiles trigger automatically when landed on (exact order TBD)
- **Tile Ownership**: Mixed system - some tiles owned by players, some neutral
- **Player Movement**: Players do not move themselves directly; only via board rotation or special tile actions
- **Prevent Back-Forth**: Will use game rules approach (specific mechanics TBD)
- **Tile Placement**: Occurs during gameplay, not just during setup

### Inconsistencies Resolved

1. **Rotation Cost vs Generation**: Originally seemed contradictory - clarified as separate systems (pay to rotate, then gain resources)
2. **Tile Placement Timing**: Notes suggested both setup and during-game - clarified as during-game placement
3. **Player Movement**: Notes said players "can move themselves" but also "often stationary" - clarified as only via tile actions
4. **Territorial vs Neutral**: Notes suggested territorial play but also neutral tiles - clarified as mixed ownership system

### Design Philosophy Notes

- **Replayability**: Tile placement system should enable high replayability
- **Phases**: Designer loves games with phases - consider phase-based structure
- **Antagonism**: When territories connect, moving one affects others - creates interesting player interaction
- **Control vs Need**: Players may need to use control to access resources closer to opponents
- **Physical Construction**: Notes mention physical construction ideas (grooved wooden ring) - not relevant for digital prototype but shows design intent

---

## Prototype Considerations

### Digital Implementation Notes

**Core Systems to Implement**:

1. **Board Representation**
   - Circular array/list of tile slots
   - Visual ring layout
   - Track gaps/empty slots

2. **Tile System**
   - Tile objects with:
     - Effect type/enum
     - Ownership (player ID or neutral)
     - Visual representation
     - Effect resolution logic

3. **Rotation System**
   - Push mechanic: player selects tile and direction
   - Chain reaction calculation
   - Full rotation detection (no gaps)
   - Animation system for visual feedback

4. **Player System**
   - Player tokens positioned on board edge
   - Track current tile position
   - Resource and rotation point tracking

5. **Resource Management**
   - Resource counters per player
   - Rotation point counters
   - Victory point tracking

6. **Effect Resolution System**
   - Queue/resolution order for tile effects
   - Handle simultaneous triggers
   - Effect execution logic

**Technical Considerations**:

- Circular data structure for board (array with wrap-around logic)
- Efficient gap detection for rotation
- Effect resolution queue/stack
- State management for game phases
- UI for tile placement and rotation selection

**Minimum Viable Prototype Features**:

- Basic board with tiles
- Push/rotation mechanic
- Simple tile effects (resource generation)
- Player movement via rotation
- Basic resource tracking

**Future Enhancements**:

- All tile types implemented
- Advanced rotation cost/prevention systems
- Territorial mechanics
- Tile ownership and upgrade systems
- Victory condition implementation

---

## Notes

### January 22, 2026

- Trying to calculate where your opponents will end up when moving the board is tricky, especially with many opponents and when making large movements
- If we keep movement tiles then players need to have some way to move on their own, else all players will eventually get swept up and end up in the same position, unable to get away

---

## Next Steps

1. Resolve all "TO BE DETERMINED" items in Unresolved Design Questions section
2. Finalize turn structure
3. Design initial setup procedure
4. Create complete tile type list (resolve "???")
5. Implement prevent back-forth rotation rules
6. Design victory condition
7. Create digital prototype based on finalized rules

---

*Document Version: 1.0*  
*Last Updated: [Current Date]*  
*Status: In Development - Awaiting Design Decisions*

