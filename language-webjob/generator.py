import json
import logging
import time
from typing import Any

from azure.storage.queue import QueueMessage, QueueServiceClient, TextBase64EncodePolicy
from simpletransformers.language_generation import LanguageGenerationModel


class MessageBroker(object):
    logging.getLogger("azure.storage").setLevel(logging.WARNING)

    def __init__(self):
        self.connection_string: str = "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
        self.service: QueueServiceClient = QueueServiceClient.from_connection_string(self.connection_string, encode_policy=TextBase64EncodePolicy())

    def put_message(self, queue_name: str, content: Any, time_to_live=None) -> QueueMessage:
        if time_to_live is None:
            return self.service.get_queue_client(queue_name).send_message(content=content)
        else:
            return self.service.get_queue_client(queue_name).send_message(content=content, time_to_live=time_to_live)

    def get_message(self, queue_name: str) -> QueueMessage:
        return self.service.get_queue_client(queue_name).receive_message()

    def delete_message(self, queue_name: str, q, pop_receipt=None):
        return self.service.get_queue_client(queue_name).delete_message(q, pop_receipt)


def generate_response(input_prompt) -> str:
    text_model_generator = LanguageGenerationModel("gpt2", f"programmer_bot", args={
        'max_length': 1000,
        'num_return_sequences': 1,
        'repetition_penalty': 1.01,
        'stop_token': '<|endoftext|>',
        'temperature': 0.8,
        'top_k': 40,
    }, use_cuda=False)

    topic = "InContext"
    title = "Why is InContext Down?"
    body = "What is the best way to fix InContext?"
    prompt = f"<|soss r/{topic}|><|sot|>{title}<|eot|>{body}<|sost|><|eost|><|sor u/Human|>{input_prompt}<|eor|><|sor|>"

    reply = None
    refresh_args = {
        'max_length': 1000,
        'num_return_sequences': 1,
        'repetition_penalty': 1.01,
        'stop_token': '<|endoftext|>',
        'temperature': 0.8,
        'top_k': 40,
    }
    while reply is None:
        for text in text_model_generator.generate(prompt=prompt, args=refresh_args, verbose=False):
            foo = text.replace(prompt, "\n")
            if result is not None:
                reply = foo
                break
    print(prompt)
    print(reply)
    return reply


if __name__ == '__main__':
    message_broker = MessageBroker()
    while True:
        message = message_broker.get_message("input")
        if message is None:
            time.sleep(1)
            continue
        data_dict = json.loads(message.content)
        prompt = data_dict.get("text")
        result = "..."
        try:
            result = generate_response(prompt)
            result = result.replace("<|eoss|>", "")
        except Exception as e:
            print(e)
            result = "I'm sorry, I Just Fucking Broke"

        message_broker.delete_message("input", message)
        message_broker.put_message("output", json.dumps({"text": result, "sender": "bot"}))
        time.sleep(1)