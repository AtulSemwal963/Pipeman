from fastapi import HTTPException
from clickhouse_connect import get_client
import pandas as pd
import re
import os
from typing import List, Optional

def get_clickhouse_client(host: str, port: str, database: str, user: str):
    try:
        client = get_client(
            host=host,
            port=int(port),
            database=database,
            user=user,
            secure=port in ["8443", "9440"]
        )
        # Test the connection
        client.ping()
        return client
    except clickhouse_connect.exceptions.NetworkError as ne:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(ne)}")
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Database error: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Client initialization failed: {str(e)}")

def get_clickhouse_tables(host: str, port: str, database: str, user: str) -> List[str]:
    try:
        client = get_clickhouse_client(host, port, database, user)
        tables = client.query("SHOW TABLES").result_rows
        return [t[0] for t in tables]
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Table fetch failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Table fetch failed: {str(e)}")

def get_clickhouse_columns(host: str, port: str, database: str, user: str, table: str) -> List[str]:
    try:
        if not table or not re.match(r"^[a-zA-Z0-9_]+$", table):
            raise HTTPException(status_code=400, detail="Invalid table name")
        client = get_clickhouse_client(host, port, database, user)
        columns = client.query(f"DESCRIBE TABLE {table}").result_rows
        return [c[0] for c in columns]
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Column fetch failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Column fetch failed: {str(e)}")

def ingest_clickhouse_to_flatfile(
    host: str, port: str, database: str, user: str,
    table: str, columns: List[str], output_file: str, delimiter: str
) -> int:
    try:
        if not table or not columns:
            raise HTTPException(status_code=400, detail="Table and columns required")
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", os.path.basename(output_file)):
            raise HTTPException(status_code=400, detail="Invalid output filename")
        if not re.match(r"^[a-zA-Z0-9_]+$", table):
            raise HTTPException(status_code=400, detail=f"Invalid table name: {table}")
        
        client = get_clickhouse_client(host, port, database, user)
        query = f"SELECT {', '.join(columns)} FROM {table}"
        result = client.query(query)
        df = pd.DataFrame(result.result_rows, columns=columns)
        
        output_path = os.path.join("Uploads", output_file)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, sep=delimiter, index=False)
        return len(df)
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

def preview_clickhouse_data(
    host: str, port: str, database: str, user: str,
    table: str, columns: List[str]
) -> dict:
    try:
        if not table or not columns:
            raise HTTPException(status_code=400, detail="Table and columns required")
        if not re.match(r"^[a-zA-Z0-9_]+$", table):
            raise HTTPException(status_code=400, detail=f"Invalid table name: {table}")
        
        client = get_clickhouse_client(host, port, database, user)
        query = f"SELECT {', '.join(columns)} FROM {table} LIMIT 100"
        result = client.query(query)
        return {"data": result.result_rows, "columns": columns}
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")