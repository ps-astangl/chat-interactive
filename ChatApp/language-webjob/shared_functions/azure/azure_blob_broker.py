from azure.storage.blob import BlobServiceClient


class BlobBroker(object):
    import logging
    logging.getLogger("azure.storage").setLevel(logging.WARNING)

    def __init__(self, container_name, blob_name):
        self.blob_service_client = BlobServiceClient.from_connection_string("")
        self.container_name = container_name
        self.blob_name = blob_name

    def download_blob(self):
        return self.blob_service_client.get_blob_client(container=self.container_name, blob=self.blob_name).download_blob()

    def upload_blob(self, data):
        return self.blob_service_client.get_blob_client(container=self.container_name, blob=self.blob_name).upload_blob(data)