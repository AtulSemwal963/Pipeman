# PipeMan

PipeMan is an open-source tool for bidirectional data ingestion between ClickHouse and Flat Files (e.g., CSVs), featuring JWT authentication, schema discovery, and a Vite-powered frontend.

## Prerequisites

- Python 3.9–3.11
- Node.js 16+
- Docker and Docker Compose
- Git

## Project Structure

- `Backend/`: FastAPI server for connecting to ClickHouse and Flat Files.
- `Frontend/`: Vite-based UI for managing data ingestion.

## Setup Instructions

### Backend

1. Navigate to the Backend folder:
   ```bash
   cd Pipeman/Backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv .
   source bin/activate  # On Windows: .\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server:
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. Build and run the ClickHouse Docker instance:
   ```bash
   docker-compose up -d
   ```

6. Access the ClickHouse client for SQL queries:
   ```bash
   docker exec -it clickhouse-server clickhouse-client
   ```

### Frontend

1. Navigate to the Frontend folder:
   ```bash
   cd Pipeman/Frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

- Open your browser to `http://localhost:5173` (or the Vite port shown).
- Use the UI to connect to ClickHouse or Flat Files, explore schemas, select columns, and start ingestion.

## Contributing

Fork the repo, submit pull requests, or open issues at `github.com/your-repo/pipeman`.

## License

MIT