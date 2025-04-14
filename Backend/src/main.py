from fastapi import FastAPI, HTTPException, UploadFile, File
from .models import ConnectionRequest, IngestionRequest
from .clickhouse_service import get_clickhouse_tables, get_clickhouse_columns, ingest_clickhouse_to_flatfile, preview_clickhouse_data
from .flatfile_service import save_uploaded_file, get_flatfile_schema, ingest_flatfile_to_clickhouse, preview_flatfile_data
from typing import Optional

app = FastAPI(title="ClickHouse-FlatFile Ingestion API")

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
            request.host, request.port, request.database, request.user, request.jwt_token
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
                request.host, request.port, request.database, request.user, request.jwt_token, table
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
            if not request.tables or not request.output_file:
                raise HTTPException(status_code=400, detail="Tables and output file required")
            count = ingest_clickhouse_to_flatfile(
                request.host, request.port, request.database, request.user, request.jwt_token,
                request.tables, request.columns or [], request.output_file, request.delimiter or ",",
                request.join_condition
            )
        elif request.source == "flatfile":
            if not request.filename or not request.table:
                raise HTTPException(status_code=400, detail="Filename and table required")
            count = ingest_flatfile_to_clickhouse(
                request.filename, request.delimiter, request.host, request.port,
                request.database, request.user, request.jwt_token, request.table, request.columns
            )
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
            if not request.tables:
                raise HTTPException(status_code=400, detail="Tables required")
            return preview_clickhouse_data(
                request.host, request.port, request.database, request.user, request.jwt_token,
                request.tables, request.columns or [], request.join_condition
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