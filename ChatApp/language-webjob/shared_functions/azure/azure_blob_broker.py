from azure.storage.blob import BlobServiceClient


class BlobBroker(object):
    import logging
    logging.getLogger("azure.storage").setLevel(logging.WARNING)

    def __init__(self, container_name, blob_name):
        self.blob_service_client = BlobServiceClient.from_connection_string("DefaultEndpointsProtocol=https;AccountName=ajdevreddit;AccountKey=+9066TCgdeVignRdy50G4qjmNoUJuibl9ERiTGzdV4fwkvgdV3aSVqgLwldgZxj/UpKLkkfXg+3k+AStjFI33Q==;BlobEndpoint=https://ajdevreddit.blob.core.windows.net/;QueueEndpoint=https://ajdevreddit.queue.core.windows.net/;TableEndpoint=https://ajdevreddit.table.core.windows.net/;FileEndpoint=https://ajdevreddit.file.core.windows.net/;")
        self.container_name = container_name
        self.blob_name = blob_name

    def download_blob(self):
        return self.blob_service_client.get_blob_client(container=self.container_name, blob=self.blob_name).download_blob()

    def upload_blob(self, data):
        return self.blob_service_client.get_blob_client(container=self.container_name, blob=self.blob_name).upload_blob(data)