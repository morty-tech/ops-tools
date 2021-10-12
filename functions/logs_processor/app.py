import gzip
import base64
import json
from aws_embedded_metrics import metric_scope

@metric_scope
def lambda_handler(event, context, metrics):
    binary_data = gzip.decompress(base64.b64decode(event['awslogs']['data']))
    json_message = json.loads(binary_data)
    fields = json_message.get('logEvents')[0].get('extractedFields')
    funnel_size = int(fields.get('funnel_size'))
    staleness_value = int(fields.get('staleness_value')[:-1])
    metrics.set_namespace("/morty/staleness_metrics")
    metrics.put_metric("Staleness", staleness_value, "Seconds")
    metrics.put_metric("FunnelSize", funnel_size)
    # metrics.flush()cd
