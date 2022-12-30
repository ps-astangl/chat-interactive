import time

from simpletransformers.language_generation import LanguageGenerationModel, LanguageGenerationArgs
import re
import json
import os
import logging
from typing import Any

from azure.storage.queue import QueueMessage, QueueServiceClient, TextBase64EncodePolicy


class MessageBroker(object):
    logging.getLogger("azure.storage").setLevel(logging.WARNING)

    def __init__(self):
        self.connection_string: str = "AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;DefaultEndpointsProtocol=http;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"
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

    def clear_queue(self, queue_name: str):
        return self.service.get_queue_client(queue_name).clear_messages()

    def count_message(self, queue_name: str) -> int:
        return self.service.get_queue_client(queue_name).get_queue_properties().approximate_message_count


def capture_tag(test_string: str, expected_tag: str):
    regex = r"\<\|(.*)\|\>"

    matches = re.finditer(regex, test_string, re.MULTILINE)

    for matchNum, match in enumerate(matches, start=1):

        print("Match {matchNum} was found at {start}-{end}: {match}".format(matchNum=matchNum, start=match.start(),
                                                                            end=match.end(), match=match.group()))
        if match.group() == expected_tag:
            print(f"{match.group()} {expected_tag}")
            return_string = test_string.replace(match.group(), "")
            return return_string

        for groupNum in range(0, len(match.groups())):
            groupNum = groupNum + 1

            print("Group {groupNum} found at {start}-{end}: {group}".format(groupNum=groupNum,
                                                                            start=match.start(groupNum),
                                                                            end=match.end(groupNum),
                                                                            group=match.group(groupNum)))


def generate_response(input_prompt) -> str:
    text_model_generator = LanguageGenerationModel("gpt2", f"programmer_bot", args={
        'max_length': 1000,
        'num_return_sequences': 1,
        'repetition_penalty': 1.01,
        'stop_token': '<|endoftext|>',
        'temperature': 0.8,
        'top_k': 40,
    }, use_cuda=False)

    subject = "What is the best way to use the InContext App?"
    prompt = f"<|soss r/InContext|><|sot|>{subject}<|eot|><|sost|><|eost|><|sor u/Human|>{input_prompt}<|eor|><|sor|>"

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
            result1 = result.replace("<|eoss|>", "")
            result = re.sub('\\n', '  ', result1)
        except Exception as e:
            print(e)
            result = "I'm sorry, I Just Fucking Broke"

        message_broker.delete_message("input", message)
        message_broker.put_message("output", json.dumps({"text": result, "sender": "bot"}))
        time.sleep(10)