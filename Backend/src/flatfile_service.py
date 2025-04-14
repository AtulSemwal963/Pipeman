from fastapi import HTTPException, UploadFile
import pandas as pd
import os
import re
from typing import List, Optional
from .utils import map_pandas_to_clickhouse_types

def save_uploaded_file(file: UploadFile, upload_dir: str = "Uploads") -> str:
    try:
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, file.filename)
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", file.filename):
            raise HTTPException(status_code=400, detail="Invalid filename")
        with open(file_path, "wb") as f:
            f.write(file.file.read())
        return file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

def test_flatfile_config(filename: str, delimiter: str = None) -> dict:
    if not filename:
        raise HTTPException(status_code=400, detail="Filename required")
    if delimiter and len(delimiter) != 1:
        raise HTTPException(status_code=400, detail="Delimiter must be a single character")
    return {"status": "File configuration validated"}

def get_flatfile_schema(filename: str, delimiter: str = None) -> List[str]:
    try:
        file_path = os.path.join("Uploads", filename)
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", filename):
            raise HTTPException(status_code=400, detail="Invalid filename")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path, nrows=1)
        elif filename.endswith(".csv"):
            if not delimiter:
                raise HTTPException(status_code=400, detail="Delimiter required for CSV")
            df = pd.read_csv(file_path, sep=delimiter, nrows=1)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        return df.columns.tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Flat file schema fetch failed: {str(e)}")

def ingest_flatfile_to_clickhouse(
    filename: str, delimiter: str, host: str, port: str, database: str,
    user: str, jwt_token: str, table: str, columns: List[str]
) -> int:
    try:
        from .clickhouse_service import get_clickhouse_client
        file_path = os.path.join("Uploads", filename)
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", filename):
            raise HTTPException(status_code=400, detail="Invalid filename")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        if not re.match(r"^[a-zA-Z0-9_]+$", table):
            raise HTTPException(status_code=400, detail="Invalid table name")
        
        # Read data
        if filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path, usecols=columns)
        elif filename.endswith(".csv"):
            if not delimiter:
                raise HTTPException(status_code=400, detail="Delimiter required for CSV")
            df = pd.read_csv(file_path, sep=delimiter, usecols=columns)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        if columns:
            df = df[columns]
        
        # Map pandas dtypes to ClickHouse types
        column_types = map_pandas_to_clickhouse_types(df.dtypes)
        column_defs = ", ".join([f"`{col}` {col_type}" for col, col_type in zip(df.columns, column_types)])
        
        # Create table
        client = get_clickhouse_client(host, port, database, user, jwt_token)
        client.command(f"""
            CREATE TABLE IF NOT EXISTS {table} ({column_defs})
            ENGINE = MergeTree() ORDER BY tuple()
        """)
        
        # Insert data in batches
        batch_size = 10000
        total_rows = 0
        for start in range(0, len(df), batch_size):
            batch = df.iloc[start:start + batch_size]
            client.insert_df(table=table, df=batch)
            total_rows += len(batch)
        
        return total_rows
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

def preview_flatfile_data(filename: str, delimiter: str, columns: List[str]) -> dict:
    try:
        file_path = os.path.join("Uploads", filename)
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", filename):
            raise HTTPException(status_code=400, detail="Invalid filename")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        if filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path, usecols=columns, nrows=100)
        elif filename.endswith(".csv"):
            if not delimiter:
                raise HTTPException(status_code=400, detail="Delimiter required for CSV")
            df = pd.read_csv(file_path, sep=delimiter, usecols=columns, nrows=100)
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type")
        
        if columns:
            df = df[columns]
        
        return {"data": df.values.tolist(), "columns": df.columns.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")