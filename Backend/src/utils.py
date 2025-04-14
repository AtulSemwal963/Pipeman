import pandas as pd

def map_pandas_to_clickhouse_types(dtypes: pd.Series) -> list:
    """
    Map pandas dtypes to ClickHouse data types for table creation.
    """
    type_mapping = {
        "int64": "Int64",
        "int32": "Int32",
        "float64": "Float64",
        "float32": "Float32",
        "object": "String",
        "string": "String",
        "bool": "UInt8",
        "datetime64[ns]": "DateTime"
    }
    return [type_mapping.get(str(dtype), "String") for dtype in dtypes]