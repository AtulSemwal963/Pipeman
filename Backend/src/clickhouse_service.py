from fastapi import HTTPException
import clickhouse_connect
import pandas as pd
import re
import os
from typing import List, Optional

def get_clickhouse_client(host: str, port: str, database: str, user: str, jwt_token: str) -> clickhouse_connect.Client:
    try:
        return clickhouse_connect.get_client(
            host=host,
            port=int(port),
            database=database,
            user=user,
            http_headers={"Authorization": f"Bearer {jwt_token}" if jwt_token else None},
            secure=port in ["8443", "9440"]
        )
    except clickhouse_connect.exceptions.NetworkError as ne:
        raise HTTPException(status_code=500, detail=f"Connection failed: {str(ne)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Client initialization failed: {str(e)}")

def get_clickhouse_tables(host: str, port: str, database: str, user: str, jwt_token: str) -> List[str]:
    try:
        client = get_clickhouse_client(host, port, database, user, jwt_token)
        tables = client.query("SHOW TABLES").result_rows
        return [t[0] for t in tables]
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Table fetch failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Table fetch failed: {str(e)}")

def get_clickhouse_columns(host: str, port: str, database: str, user: str, jwt_token: str, table: str) -> List[str]:
    try:
        if not table or not re.match(r"^[a-zA-Z0-9_]+$", table):
            raise HTTPException(status_code=400, detail="Invalid table name")
        client = get_clickhouse_client(host, port, database, user, jwt_token)
        columns = client.query(f"DESCRIBE TABLE {table}").result_rows
        return [c[0] for c in columns]
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Column fetch failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Column fetch failed: {str(e)}")

def ingest_clickhouse_to_flatfile(
    host: str, port: str, database: str, user: str, jwt_token: str,
    tables: List[str], columns: List[str], output_file: str, delimiter: str,
    join_condition: Optional[str] = None
) -> int:
    try:
        if not tables or not columns:
            raise HTTPException(status_code=400, detail="Tables and columns required")
        if not re.match(r"^[a-zA-Z0-9_\-\.]+$", os.path.basename(output_file)):
            raise HTTPException(status_code=400, detail="Invalid output filename")
        for table in tables:
            if not re.match(r"^[a-zA-Z0-9_]+$", table):
                raise HTTPException(status_code=400, detail=f"Invalid table name: {table}")
        
        client = get_clickhouse_client(host, port, database, user, jwt_token)
        
        # Handle single table or multi-table join
        if len(tables) == 1:
            query = f"SELECT {', '.join(columns)} FROM {tables[0]}"
        else:
            if not join_condition:
                raise HTTPException(status_code=400, detail="Join condition required for multiple tables")
            aliases = [f"{table} AS t{i+1}" for i, table in enumerate(tables)]
            query = f"SELECT {', '.join(columns)} FROM {aliases[0]} JOIN {aliases[1]} ON {join_condition}"
        
        # Stream results to CSV in batches
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
    host: str, port: str, database: str, user: str, jwt_token: str,
    tables: List[str], columns: List[str], join_condition: Optional[str] = None
) -> dict:
    try:
        if not tables or not columns:
            raise HTTPException(status_code=400, detail="Tables and columns required")
        for table in tables:
            if not re.match(r"^[a-zA-Z0-9_]+$", table):
                raise HTTPException(status_code=400, detail=f"Invalid table name: {table}")
        
        client = get_clickhouse_client(host, port, database, user, jwt_token)
        
        if len(tables) == 1:
            query = f"SELECT {', '.join(columns)} FROM {tables[0]} LIMIT 100"
        else:
            if not join_condition:
                raise HTTPException(status_code=400, detail="Join condition required for multiple tables")
            aliases = [f"{table} AS t{i+1}" for i, table in enumerate(tables)]
            query = f"SELECT {', '.join(columns)} FROM {aliases[0]} JOIN {aliases[1]} ON {join_condition} LIMIT 100"
        
        result = client.query(query)
        return {"data": result.result_rows, "columns": columns}
    except clickhouse_connect.exceptions.DatabaseError as de:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(de)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")