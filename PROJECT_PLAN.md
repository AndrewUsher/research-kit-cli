# Intelligent Research Assistant CLI - Project Plan

An autonomous CLI tool for conducting comprehensive research, built with React/Ink for terminal UIs.

## Project Overview

A terminal-based research assistant that searches the web, analyzes documents, synthesizes findings, and generates structured reports with proper citations.

**Tech Stack:** TypeScript, React, Ink v4, Node.js 16+

---

## Phase 1: Project Foundation (Week 1)

### Goals

- Set up TypeScript project structure with Ink
- Create basic CLI entry point with argument parsing
- Implement configuration management
- Establish testing infrastructure

### Tasks

#### 1.1 Project Initialization

- [ ] Initialize npm project with `type: "module"`
- [ ] Install dependencies: `ink`, `react`, `meow`, `ink-testing-library`
- [ ] Configure TypeScript with strict mode and React JSX
- [ ] Set up Prettier and XO linting
- [ ] Create directory structure:
  ```
  research-cli/
  ├── source/
  │   ├── cli.tsx           # Entry point
  │   ├── app.tsx           # Main app component
  │   ├── components/       # Reusable Ink components
  │   ├── commands/         # Command handlers
  │   ├── lib/             # Utilities and helpers
  │   └── types/           # TypeScript definitions
  ├── dist/                # Compiled output
  ├── tests/               # Test files
  └── package.json
  ```

#### 1.2 CLI Infrastructure

- [ ] Implement `cli.tsx` with meow argument parsing
- [ ] Create basic command routing (research, list, config, etc.)
- [ ] Add `--help` and `--version` flags
- [ ] Set up error handling and exit codes

#### 1.3 Configuration System

- [ ] Create config loader for `~/.research-cli/config.yaml`
- [ ] Implement default settings (depth, citation style, autonomy)
- [ ] Add environment variable support (`RESEARCH_CLI_*`)
- [ ] Build `research config set/show` commands

#### 1.4 Testing Setup

- [ ] Configure AVA for TypeScript/TSX testing
- [ ] Create initial test for CLI parsing
- [ ] Add test utilities for Ink components

### Deliverables

- Working CLI that prints help/version
- Configuration file can be read/written
- Test suite runs successfully

---

## Phase 2: Core UI Components (Week 1-2)

### Goals

- Build reusable Ink components for research workflow
- Create progress indicators and status displays
- Implement interactive menus and prompts

### Tasks

#### 2.1 Progress Components

- [ ] `ProgressBar` - Visual progress indicator with stages
- [ ] `MilestoneTracker` - Show [1/5] Research stages
- [ ] `Spinner` - Loading states for async operations
- [ ] `StatusBox` - Configuration summary display

#### 2.2 Interactive Elements

- [ ] `CheckpointPrompt` - Pause with continue/review/add options
- [ ] `MenuSelector` - Arrow-key navigation for options
- [ ] `ConfirmationDialog` - Yes/no prompts
- [ ] `TextInput` - User input with validation

#### 2.3 Report Display Components

- [ ] `ReportViewer` - Terminal-friendly report display
- [ ] `CitationList` - Formatted reference list
- [ ] `SummaryPanel` - Research statistics display
- [ ] `FileTree` - Output file listing

#### 2.4 Layout Components

- [ ] `BoxFrame` - Unicode box-drawing containers
- [ ] `ScrollArea` - Scrollable content viewer
- [ ] `TwoColumn` - Side-by-side layouts

### Deliverables

- Component library with Storybook-style examples
- Interactive demo showing progress flow
- Test coverage for all components

---

## Phase 3: Research Engine - Core (Week 2-3)

### Goals

- Implement web search functionality
- Build source management and quality filtering
- Create document download and caching system

### Tasks

#### 3.1 Web Search Module

- [ ] Integrate search API (Google Custom Search or similar)
- [ ] Implement search result parsing
- [ ] Add source metadata extraction (title, author, date)
- [ ] Build source credibility scoring
- [ ] Support for different search depths (quick/medium/deep)

#### 3.2 Source Management

- [ ] Create `Source` type with metadata
- [ ] Implement source quality filtering (authority prioritization)
- [ ] Build source deduplication
- [ ] Add paywall/inaccessible detection
- [ ] Create source cache system

#### 3.3 Document Processing

- [ ] PDF text extraction
- [ ] HTML content parsing
- [ ] Smart sampling for long documents
- [ ] Video transcript extraction (YouTube, etc.)
- [ ] Document metadata extraction

#### 3.4 Caching System

- [ ] HTTP request caching with TTL
- [ ] Cache directory management (`~/.research-cli/cache/`)
- [ ] Cache invalidation and cleanup
- [ ] Progress persistence for interruptions

### Deliverables

- `research <topic>` command works end-to-end
- Sources are found, downloaded, and cached
- Progress displays correctly during search

---

## Phase 4: Analysis & Synthesis (Week 3-4)

### Goals

- Implement content analysis and key finding extraction
- Build synthesis engine for combining sources
- Create conflict detection and resolution

### Tasks

#### 4.1 Content Analysis

- [ ] Key finding extraction from sources
- [ ] Theme identification and grouping
- [ ] Claim extraction with source attribution
- [ ] Sentiment/context analysis
- [ ] Entity recognition (names, organizations, etc.)

#### 4.2 Synthesis Engine

- [ ] Cross-reference fact-checking
- [ ] Confidence scoring algorithm
- [ ] Conflict detection between sources
- [ ] Evidence weighing for claims
- [ ] Gap identification in research

#### 4.3 AI Integration

- [ ] Integrate LLM API (Amazon Nova 2 Pro or similar)
- [ ] Build prompting system for analysis
- [ ] Implement streaming responses
- [ ] Add cost tracking per research task
- [ ] Create reasoning transparency logs

#### 4.4 Document Understanding

- [ ] Multi-document comparison
- [ ] Finding correlation across sources
- [ ] Timeline extraction for temporal data
- [ ] Statistical data extraction

### Deliverables

- Analysis completes successfully on test topics
- Synthesized findings with confidence scores
- Transparent reasoning logs (with `--transparency detail`)

---

## Phase 5: Report Generation (Week 4-5)

### Goals

- Generate structured research reports
- Implement multiple output formats
- Create visualization generation

### Tasks

#### 5.1 Report Structure

- [ ] Implement fixed template sections:
  - Executive Summary
  - Introduction
  - Main Findings (dynamic sections)
  - Conclusions
  - Limitations
  - References
- [ ] Citation formatting (APA, MLA, Chicago, IEEE, Harvard)
- [ ] Inline citation linking [1], [2], etc.

#### 5.2 Output Formats

- [ ] Markdown output (default, terminal-friendly)
- [ ] PDF generation (using puppeteer or similar)
- [ ] DOCX export
- [ ] HTML standalone export
- [ ] JSON structured data export

#### 5.3 Visualizations

- [ ] Data chart generation (PNG/SVG)
- [ ] Concept map creation
- [ ] Timeline visualizations
- [ ] Comparison tables

#### 5.4 Output Management

- [ ] Organized directory structure (`./research_output/`)
- [ ] Metadata JSON generation
- [ ] Report ID generation and tracking
- [ ] File naming conventions

### Deliverables

- Complete report generation in all formats
- Visualizations render correctly
- Citations formatted correctly

---

## Phase 6: Advanced Features (Week 5-6)

### Goals

- Implement checkpoint autonomy mode
- Add refinement and follow-up research
- Build history and archive management

### Tasks

#### 6.1 Checkpoint Mode

- [ ] Pause at each research stage
- [ ] Interactive review prompts
- [ ] Option to add/modify search terms
- [ ] Skip to next stage functionality
- [ ] State persistence between checkpoints

#### 6.2 Refinement System

- [ ] `refine <report-id>` command
- [ ] Focus on specific sections
- [ ] Additional source searching
- [ ] Version tracking (v1, v2, etc.)
- [ ] Diff view between versions

#### 6.3 Archive Management

- [ ] `research list` - Display past research
- [ ] `research show <id>` - View specific report
- [ ] `research search` - Search archive
- [ ] `research export` - Export to different formats
- [ ] Archive cleanup and organization

#### 6.4 Batch Processing

- [ ] `research batch --file` command
- [ ] JSON input format parsing
- [ ] Concurrent research execution
- [ ] Batch progress tracking

### Deliverables

- Checkpoint mode pauses and resumes correctly
- Refinement creates new report versions
- Archive commands work end-to-end

---

## Phase 7: Interactive TUI Mode (Week 6-7)

### Goals

- Build full-screen interactive interface
- Implement dashboard-style main menu
- Add real-time research monitoring

### Tasks

#### 7.1 TUI Framework

- [ ] `research --interactive` command
- [ ] Full-screen terminal takeover
- [ ] Responsive layout system
- [ ] Keyboard navigation (vim-style)

#### 7.2 Dashboard Interface

- [ ] Main menu with options:
  - New Research
  - Recent Research
  - List All
  - Search Archive
  - Configuration
- [ ] Recent research quick access
- [ ] Statistics display

#### 7.3 Interactive Research Flow

- [ ] Form-based research setup
- [ ] Real-time progress monitoring
- [ ] Interactive checkpoints in TUI mode
- [ ] Inline report viewing with scroll

#### 7.4 TUI Components

- [ ] `Dashboard` - Main interface
- [ ] `ResearchForm` - Input fields
- [ ] `ActivityFeed` - Real-time updates
- [ ] `ArchiveBrowser` - Search and filter

### Deliverables

- Interactive mode launches successfully
- Dashboard displays correctly
- Can complete research end-to-end in TUI

---

## Phase 8: Polish & Collaboration (Week 7-8)

### Goals

- Add collaboration features
- Implement feedback and learning
- Final polish and optimization

### Tasks

#### 8.1 Collaboration Features

- [ ] `research assign` command
- [ ] `research merge` for combining reports
- [ ] `research status` for active tasks
- [ ] Research server mode (optional)

#### 8.2 Feedback System

- [ ] `research feedback` command
- [ ] Rating storage (1-5 stars)
- [ ] Comment storage
- [ ] Learning metrics tracking
- [ ] `research stats` command

#### 8.3 Scripting Support

- [ ] JSON output mode (`--json`)
- [ ] Quiet mode (`--quiet`)
- [ ] JSON progress (`--progress=json`)
- [ ] Proper exit codes
- [ ] Shell completion (bash, zsh, fish)

#### 8.4 Performance & Reliability

- [ ] Concurrent download limiting
- [ ] Memory optimization for large documents
- [ ] Graceful error handling
- [ ] Interruption recovery
- [ ] Resource usage tracking

#### 8.5 Documentation

- [ ] README with installation and usage
- [ ] Man page generation
- [ ] Example sessions and tutorials
- [ ] API documentation for scripting

### Deliverables

- All commands work reliably
- Documentation complete
- Performance optimized
- Ready for release

---

## Implementation Priorities

### MVP (Must Have)

1. Basic CLI with argument parsing
2. Web search and source management
3. Simple report generation (Markdown only)
4. Progress indicators
5. Configuration system

### Phase 2 (Should Have)

1. Document attachment support
2. Multiple output formats (PDF, HTML)
3. Checkpoint mode
4. Archive management
5. Interactive TUI mode

### Phase 3 (Nice to Have)

1. Visualizations
2. Collaboration features
3. Batch processing
4. Feedback system
5. Shell completions

---

## Technical Considerations

### Dependencies

- **Core:** ink, react, meow
- **HTTP:** node-fetch or undici
- **Parsing:** cheerio (HTML), pdf-parse (PDFs)
- **Export:** puppeteer (PDF), docx (Word)
- **Charts:** chart.js or similar
- **Config:** js-yaml

### Architecture Patterns

- Command pattern for CLI routing
- State machine for research workflow
- Observer pattern for progress updates
- Cache-aside for HTTP caching

### Testing Strategy

- Unit tests for utilities and components
- Integration tests for research flow
- E2E tests for CLI commands
- Mock external APIs for tests

---

## Success Metrics

- [ ] CLI starts in < 1 second
- [ ] Research completes successfully for test topics
- [ ] Reports generate in all formats without errors
- [ ] All tests pass
- [ ] Memory usage stays < 500MB during research
- [ ] Handles interruptions gracefully

---

## Next Steps

1. Start with Phase 1: Set up project structure
2. Implement CLI parsing with one dummy command
3. Build progress components
4. Add web search integration
5. Iterate through remaining phases

**Estimated Timeline:** 6-8 weeks for full implementation
**Team Size:** 1-2 developers
