import pandas
import re, json
import signal
from functools import lru_cache
from concurrent.futures import ProcessPoolExecutor as PoolExecutor, wait as wait_on_result


# Number of in-memory processable tasks without exceeding memory usage. Could be tweeked for optimal performance.
BATCH_SIZE = 1000
# Initializing a handle to OS cpu cores for every process (long-lived) once.
pool_executor = PoolExecutor()


def pool_clean_up(*args):
    pool_executor.shutdown(wait = False, cancel_futures = True)
    exit(signal.SIGINT)
    
# Releasing OS resources on SIGINT events.   
signal.signal(signal.SIGINT, pool_clean_up)

@lru_cache(maxsize=32)
def _get_rules(rule_file_path):
    with open(file = rule_file_path, mode = 'r', encoding = 'utf-8') as file:
        return json.load(file)
        
@lru_cache(maxsize=32)
def _get_regex(pattern):
    return None if not pattern else re.compile(pattern)

'''
    Processes a pandas.core.frame.Pandas (row).
'''
# TODO: assuming that all the columns are mentioned
def _process_record(rule_file_path, record):
    rules = _get_rules(rule_file_path) 
    
    def str_join(prefix, delimiter, suffix, words):
        return f"{prefix}{delimiter.join(words)}{suffix}"
    
    def create_entry(col, val):
        rule = rules[col]
        match = _get_regex(rule["r_match"]).fullmatch(val)
        groups = match.groups() if match else []
        entry = { "c_name": col, "p_type": rule["p_type"], "a_type": rule["a_type"], "raw_data": val }
        in_set = set(rule["in"] or groups)
        
        if groups and all([group in in_set for group in groups]):
            entry["output"] = str_join(rule["o_prefix"], rule["o_delimiter"], rule["o_suffix"], groups)
        else:
            entry["output"] = "N/A"
            
        return entry
     
    return [ create_entry(col, val) for col, val in record.items() if col != "Index" ]


def _write_to_output(output_file_path, content1 = "", content2 = ""):
    with open(file = output_file_path, mode = 'a', encoding = 'utf-8') as file:
        file.writelines([content1, content2])
  
'''
    Processes a pandas.core.frame.DataFrame (batch of rows) and writes the result of the batch to the output file.
    Note:
    - Implementing the delay here as opposed to submitting all the batched dataframes at once is done to prevent execess memory usage.
    - A practical example is when the number of columns of a row is very large which result to a large byte size per row.
'''
def _process_batch(rule_file_path, output_file_path, batch, sep = ""):
    results = [ pool_executor.submit(_process_record, rule_file_path, record._asdict()) for record in batch.itertuples() ]
    wait_on_result(results)
    f_output = json.dumps([ result.result() for result in results ], indent = 2)
    _write_to_output(output_file_path, sep, f_output)
    
'''
    Handles the user type inference and data cleaning request.
'''
def process_request(data_file_path, rule_file_path, output_file_path):
    # open initializing the output json file
    _write_to_output(output_file_path, "[")
    
    # Chunking, No-Indexing and Preserving of original data is done to prevent execess memory usage and better overall performance.
    with pandas.read_csv(data_file_path, engine = 'c', chunksize = BATCH_SIZE, dtype = str, index_col = False) as batch_reader:
        # Doing this to adhere to the json-file format requirement.
        _process_batch(rule_file_path, output_file_path, next(batch_reader))
        # This utilizes the benefit of list comprehension without the memory cost since the condition is always False.
        _ = [ _ for batch in batch_reader if _process_batch(rule_file_path, output_file_path, batch, ",\n") ]
    
    # close initializing the output json file
    _write_to_output(output_file_path, "]")