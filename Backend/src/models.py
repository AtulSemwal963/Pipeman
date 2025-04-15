from pydantic import BaseModel, validator
from typing import Optional, List
from enum import Enum

class SourceType(str, Enum):
    clickhouse = "clickhouse"
    flatfile = "flatfile"

class ConnectionRequest(BaseModel):
    source: SourceType
    host: Optional[str] = "localhost"
    port: Optional[str] = "8123"
    database: Optional[str] = "default"
    user: Optional[str] = "default"
    filename: Optional[str] = None
    delimiter: Optional[str] = None

    @validator("port")
    def validate_port(cls, v):
        if v and not v.isdigit():
            raise ValueError("Port must be a number")
        return v

    @validator("delimiter")
    def validate_delimiter(cls, v, values):
        if values.get("source") == SourceType.flatfile and v and len(v) != 1:
            raise ValueError("Delimiter must be a single character")
        return v

class IngestionRequest(ConnectionRequest):
    table: Optional[str] = None
    columns: Optional[List[str]] = None
    output_file: Optional[str] = None