import logging

from azure.core.paging import ItemPaged
from azure.storage.queue import QueueServiceClient, QueueMessage, TextBase64EncodePolicy, QueueProperties
from typing_extensions import Any

logging.getLogger("azure.storage").setLevel(logging.WARNING)

class MessageBroker(object):
    def __init__(self):
        self.connection_string: str = "DefaultEndpointsProtocol=https;AccountName=ajdevreddit;AccountKey=+9066TCgdeVignRdy50G4qjmNoUJuibl9ERiTGzdV4fwkvgdV3aSVqgLwldgZxj/UpKLkkfXg+3k+AStjFI33Q==;BlobEndpoint=https://ajdevreddit.blob.core.windows.net/;QueueEndpoint=https://ajdevreddit.queue.core.windows.net/;TableEndpoint=https://ajdevreddit.table.core.windows.net/;FileEndpoint=https://ajdevreddit.file.core.windows.net/;"
        self.service: QueueServiceClient = QueueServiceClient.from_connection_string(self.connection_string,
                                                                                     encode_policy=TextBase64EncodePolicy())

    def put_message(self, queue_name: str, content: Any, time_to_live=None) -> QueueMessage:
        if time_to_live is None:
            return self.service.get_queue_client(queue_name).send_message(content=content)
        else:
            return self.service.get_queue_client(queue_name).send_message(content=content, time_to_live=time_to_live)

    def get_message(self, queue_name: str) -> QueueMessage:
        return self.service.get_queue_client(queue_name).receive_message()

    def delete_message(self, queue_name: str, q, pop_receipt=None):
        return self.service.get_queue_client(queue_name).delete_message(q, pop_receipt)

    def get_queues(self) -> ItemPaged[QueueProperties]:
        return self.service.list_queues()

    def delete_queue(self, queue_name: str):
        return self.service.delete_queue(queue_name)