from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from .models import ConnectionRequest, IngestionRequest
from .clickhouse_service import get_clickhouse_tables, get_clickhouse_columns, ingest_clickhouse_to_flatfile, preview_clickhouse_data
from .flatfile_service import save_uploaded_file, get_flatfile_schema, ingest_flatfile_to_clickhouse, preview_flatfile_data
from typing import Optional, List
import os
import csv
import tempfile
import io
import asyncio
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create Uploads directory if it doesn't exist
os.makedirs("Uploads", exist_ok=True)

app = FastAPI(title="ClickHouse-FlatFile Ingestion API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080", "http://127.0.0.1:3000", "http://127.0.0.1:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "ClickHouse-FlatFile Ingestion API is running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = save_uploaded_file(file)
        return {"filename": file.filename, "path": file_path}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/api/tables")
async def get_tables(request: ConnectionRequest):
    try:
        if request.source != "clickhouse":
            raise HTTPException(status_code=400, detail="Tables only supported for ClickHouse")
        tables = get_clickhouse_tables(
            request.host, request.port, request.database, request.user
        )
        return {"source": "clickhouse", "tables": tables}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Table fetch failed: {str(e)}")

@app.post("/api/columns")
async def get_columns(request: ConnectionRequest, table: Optional[str] = None):
    try:
        if request.source == "clickhouse":
            if not table:
                raise HTTPException(status_code=400, detail="Table name required")
            columns = get_clickhouse_columns(
                request.host, request.port, request.database, request.user, table
            )
            return {"source": "clickhouse", "table": table, "columns": columns}
        elif request.source == "flatfile":
            if not request.filename:
                raise HTTPException(status_code=400, detail="Filename required")
            columns = get_flatfile_schema(request.filename, request.delimiter)
            return {"source": "flatfile", "columns": columns}
        else:
            raise HTTPException(status_code=400, detail="Invalid source")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Column fetch failed: {str(e)}")

@app.post("/api/ingest")
async def ingest_data(request: IngestionRequest):
    try:
        if request.source == "clickhouse":
            if not request.table or not request.output_file:
                raise HTTPException(status_code=400, detail="Table and output file required")
            try:
                count = ingest_clickhouse_to_flatfile(
                    request.host, request.port, request.database, request.user,
                    request.table, request.columns or [], request.output_file, request.delimiter or ","
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"ClickHouse ingestion failed: {str(e)}")
        elif request.source == "flatfile":
            if not request.filename or not request.table:
                raise HTTPException(status_code=400, detail="Filename and table required")
            try:
                count = ingest_flatfile_to_clickhouse(
                    request.filename, request.delimiter, request.host, request.port,
                    request.database, request.user, request.table, request.columns
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Flat file ingestion failed: {str(e)}")
        else:
            raise HTTPException(status_code=400, detail="Invalid source")
        return {"status": "completed", "record_count": count}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@app.post("/api/preview")
async def preview_data(request: IngestionRequest):
    try:
        if request.source == "clickhouse":
            if not request.table:
                raise HTTPException(status_code=400, detail="Table required")
            return preview_clickhouse_data(
                request.host, request.port, request.database, request.user,
                request.table, request.columns or []
            )
        elif request.source == "flatfile":
            if not request.filename:
                raise HTTPException(status_code=400, detail="Filename required")
            return preview_flatfile_data(request.filename, request.delimiter, request.columns or [])
        else:
            raise HTTPException(status_code=400, detail="Invalid source")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@app.get("/api/download/{filename}")
async def download_file(
    filename: str,
    columns: Optional[List[str]] = Query(None),
    source: Optional[str] = Query(None),
    table: Optional[str] = Query(None),
    host: Optional[str] = Query(None),
    port: Optional[int] = Query(None),
    database: Optional[str] = Query(None),
    user: Optional[str] = Query(None),
    delimiter: Optional[str] = Query(",")
):
    logger.info(f"Download request received for file: {filename}")
    logger.info(f"Parameters: source={source}, table={table}, columns={columns}")
    
    try:
        if not columns:
            raise HTTPException(status_code=400, detail="No columns selected for download")

        output = io.StringIO()
        writer = csv.writer(output, delimiter=delimiter)
        
        if source == "clickhouse":
            if not all([table, host, port, database]):
                raise HTTPException(
                    status_code=400, 
                    detail="Missing required parameters for ClickHouse source"
                )
            
            try:
                logger.info(f"Fetching data from ClickHouse table: {table}")
                data = preview_clickhouse_data(host, port, database, user or 'default', table, columns)
                
                # Write header
                writer.writerow(columns)
                # Write data
                writer.writerows(data)
                logger.info(f"Successfully fetched {len(data)} rows from ClickHouse")
                
            except Exception as e:
                logger.error(f"ClickHouse data fetch error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to fetch data from ClickHouse: {str(e)}"
                )
            
        else:  # Flatfile source
            file_path = os.path.join("Uploads", filename)
            if not os.path.exists(file_path):
                logger.error(f"File not found: {file_path}")
                raise HTTPException(status_code=404, detail="File not found")
            
            try:
                with open(file_path, 'r', newline='') as source_file:
                    reader = csv.DictReader(source_file, delimiter=delimiter)
                    
                    # Write header
                    writer.writerow(columns)
                    
                    # Write selected columns
                    row_count = 0
                    for row in reader:
                        filtered_row = [row[col] for col in columns if col in row]
                        writer.writerow(filtered_row)
                        row_count += 1
                    
                    logger.info(f"Successfully processed {row_count} rows from file")
                    
            except Exception as e:
                logger.error(f"File processing error: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to process file: {str(e)}"
                )
        
        # Prepare the response
        output.seek(0)
        content = output.getvalue().encode('utf-8-sig')
        
        # Create response with proper headers
        response = StreamingResponse(
            iter([content]),
            media_type='text/csv'
        )
        
        response.headers["Content-Disposition"] = f'attachment; filename="{filename}"'
        response.headers["Content-Type"] = "text/csv; charset=utf-8"
        response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"
        
        logger.info("Successfully prepared download response")
        return response
        
    except HTTPException as e:
        logger.error(f"HTTP Exception: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")
    finally:
        if 'output' in locals():
            output.close()
            logger.info("Cleaned up resources")