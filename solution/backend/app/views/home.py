from ..utils import NamedTemporaryFile
from django.http import HttpResponse, HttpResponseBadRequest
from ..services.type_infer_etl import process_request


def is_valid_home_post(request):
    req_files = request.FILES
 
    if len(req_files) != 2:
        return False
    
    rule_file = req_files.get("rule_file")
    data_file = req_files.get("data_file")
    
    if not rule_file or not data_file or rule_file.content_type != "application/json" or data_file.content_type != "text/csv":
        return False
    
    # other validations like validating the content of both files
    return True

def home(request):    
    if request.method != 'POST' or not is_valid_home_post(request):
        return HttpResponseBadRequest()
    
    req_files, output_file = request.FILES, NamedTemporaryFile(suffix = '.json')
    data_file, rule_file = req_files.get("data_file"), req_files.get("rule_file")
    data_file_path, rule_file_path = data_file.temporary_file_path(), rule_file.temporary_file_path()
    output_file_path = output_file.name
    
    process_request(data_file_path, rule_file_path, output_file_path)
    
    response = HttpResponse(output_file.file(), content_type = 'application/force-download')
    response['Content-Disposition'] = f'attachment; filename="output.json"'
    
    return response