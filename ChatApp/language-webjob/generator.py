import hashlib
import json
import logging
import random
import sys
import threading
import time
from multiprocessing import Process
from typing import Any

from azure.core.paging import ItemPaged
from azure.storage.queue import QueueMessage, QueueServiceClient, TextBase64EncodePolicy, QueueProperties
from simpletransformers.language_generation import LanguageGenerationModel
import os
from typing import Optional
import logging
import torch
import gc
from diffusers import StableDiffusionPipeline
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient


MAT_PROC_SLEEP: int = 1

logging.getLogger("azure.storage").setLevel(logging.WARNING)

class BlobBroker(object):
    logging.getLogger("azure.storage").setLevel(logging.WARNING)
    def __init__(self, container_name, blob_name):
        self.blob_service_client = BlobServiceClient.from_connection_string("DefaultEndpointsProtocol=https;AccountName=ajdevreddit;AccountKey=+9066TCgdeVignRdy50G4qjmNoUJuibl9ERiTGzdV4fwkvgdV3aSVqgLwldgZxj/UpKLkkfXg+3k+AStjFI33Q==;BlobEndpoint=https://ajdevreddit.blob.core.windows.net/;QueueEndpoint=https://ajdevreddit.queue.core.windows.net/;TableEndpoint=https://ajdevreddit.table.core.windows.net/;FileEndpoint=https://ajdevreddit.file.core.windows.net/;")
        self.container_name = container_name
        self.blob_name = blob_name

    def download_blob(self):
        return self.blob_service_client.get_blob_client(container=self.container_name, blob=self.blob_name).download_blob()

    def upload_blob(self, data):
        return self.blob_service_client.get_blob_client(container=self.container_name, blob=self.blob_name).upload_blob(data)


class ImageGenerator(object):
    import hashlib
    def __init__(self):
        pass

    def create_image(self, prompt: str) -> Optional[str]:
        try:
            pipe: StableDiffusionPipeline = StableDiffusionPipeline.from_pretrained("/models/StableDiffusionPipeline",
                                                                                    revision="fp16",
                                                                                    torch_dtype=torch.float16,
                                                                                    safety_checker=None)
            pipe = pipe.to("cuda")

            image = pipe(prompt, guidance_scale=random.randint(7, 12), num_inference_steps=100, height=512, width=768).images[0]

            image_path = "/images/" + hashlib.md5(prompt.encode()).hexdigest() + ".png"

            image.save(image_path)

            return image_path

        except Exception as e:
            logging.info("Failed to generate image")
            return None

        finally:
            logging.info("Image generated successfully!")
            try:
                torch.cuda.empty_cache()
                gc.collect()
            except Exception as e:
                logging.info("Failed to empty cache")
                gc.collect()


class MessageBroker(object):
    logging.getLogger("azure.storage").setLevel(logging.WARNING)

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


class QueueCleaner(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.broker = MessageBroker()
        self.poll_for_message_worker_thread = threading.Thread(target=self.poll_for_message_worker, daemon=True)

    def poll_for_message_worker(self):
        while True:
            foo = self.broker.get_queues()
            for queue in foo:
                if queue.name == "message-generator" or queue.name == "submission-lock" or queue.name == "chat-input" or queue.name == "chat-output" or queue.name == "submission-generator":
                    continue
                else:
                    print(queue.name)
                    self.broker.delete_queue(queue.name)
            time.sleep(60 * 60 * 1)

    def run(self):
        self.poll_for_message_worker_thread.start()

    def stop(self):
        sys.exit(0)


class LangaugeGenerator(object):
    sender_map = {
        "Laura": f"D:\models\GusterIs4Lovers",
        "Kimmie": f"D:\models\Kimmie-v2",
        "Spez": f"D:\models\spez",
        "SportsFan": f"D:\models\SportsFanBotGhostGPT",
        "PoetBot": f"D:\models\PoetBot",
        "Yuli": f"D:\models\yuli-ban-2",
        "Nick": f"D:\models\The_JSQuareD",
        "CoopBot": f"D:\models\mega_pablo_bot",
        "PabloBot": f"D:\models\PabloBot",
        "Susan": f"D:\models\large_flightattentdent_bot",
        "ImageBot": f"D:\models\StableDiffusionPipeline",
    }

    def __init__(self, bot_name: str):
        self.model_path = self.sender_map.get(bot_name)

    def generate_response(self, input_prompt, message_topic, message_channel) -> str:
        text_model_generator = LanguageGenerationModel("gpt2", self.model_path, args={
            'max_length': 1024,
            'num_return_sequences': 1,
            'repetition_penalty': 1.01,
            'stop_token': '<|endoftext|>',
            'temperature': 0.8,
            'top_k': 40,
        }, use_cuda=True)
        # prompt = f"<|soss r/{message_channel}|><|sot|>{message_topic}<|eot|><|sost|>{message_topic}<|eost|><|sor u/Humans|>{input_prompt.strip()}<|eor|><|sor|>"
        # prompt = f"<|soss r/{message_channel}|><|sot|>{message_topic}<|eot|><|sost|>{input_prompt}<|eost|><|sor|>"
        # if random.randint(1,2) == 1:
            # Assumes continuation
        # prompt = f"<|soss r/{message_channel}|><|sot|>{message_topic}<|eot|><|sost|><|eost|><|sor u/Human|>{input_prompt}<|eost|><|sor|>"
        prompt = f"<|soss r/{message_channel}|><|sot|>{message_topic}<|eot|><|sost|>{input_prompt}<|eost|><|sor|>"
        # else:
            # Assumes new
        # prompt = f"<|soss r/{message_channel}|><|sot|>{message_topic}<|eot|><|sost|>{input_prompt}<|eost|><|sor|>"

        reply = None
        refresh_args = {
            'max_length': 1024,
            'num_return_sequences': 1,
            'repetition_penalty': 1.01,
            'stop_token': '<|endoftext|>',
            'temperature': 0.8,
            'top_k': 40,
        }
        while reply is None:
            for text in text_model_generator.generate(prompt=prompt, args=refresh_args, verbose=False):
                result = text.replace(prompt, "\n")
                if result is not None:
                    reply = result
                    break
        print(prompt)
        print(reply)
        return reply


class ProcessManager(threading.Thread):
    def __init__(self, proc_name: str):
        super().__init__(name=proc_name, daemon=True)
        self.poll_for_message_worker_thread = threading.Thread(target=self.poll_for_reply_queue, args=(), daemon=True,name=proc_name)
        self.message_broker_instance: MessageBroker = MessageBroker()

    @staticmethod
    def reply_to_thing(q: dict):
        message_broker_instance = MessageBroker()
        print(f"Got reply: {q}")
        data_dict = q
        text = data_dict.get("Text")
        prompt = data_dict.get("Prompt")
        sender = data_dict.get("Sender")
        topic = data_dict.get("Topic")
        channel = data_dict.get("Channel")
        comment_id = data_dict.get("CommentId")
        connection_id = data_dict.get("ConnectionId")
        out_queue = data_dict.get("ConnectionId")
        try:
            langauge_generator = LangaugeGenerator(sender)
            if sender == "ImageBot":
                foo = ImageGenerator().create_image(prompt)
                if foo is not None:
                    with open(foo, "rb") as f:
                        image_data = f.read()
                        BlobBroker(container_name='images', blob_name=foo).upload_blob(image_data)
                        print("https://ajdevreddit.blob.core.windows.net/images" + foo)
                        reply = "https://ajdevreddit.blob.core.windows.net/images" + foo
            else:
                reply = langauge_generator.generate_response(prompt, topic, channel)
                reply = reply.replace("<|eor|>", "")
                reply = reply.replace("<|eoss|>", "")
            print(reply)
        except Exception as e:
            print(f"Error generating reply: {e}")
            reply = "I'm sorry, I'm not feeling well today. I'll be back later."
            pass
        out_put = json.dumps(
            {
                "text": reply,
                "prompt": prompt,
                "sender": sender,
                "commentId": comment_id,
                "topic": topic,
                "connectionId": connection_id,
                "isBot": True,
                "isThinking": False,
                "channel": channel
            }
        )
        try:
            print(f"Sending reply: {out_put}")
            message_broker_instance.put_message(out_queue, out_put)
        except:
            print(f"Error putting message on queue: {out_queue}")

    time.sleep(MAT_PROC_SLEEP)

    def poll_for_reply_queue(self):
        while True:
            try:
                message: QueueMessage = self.message_broker_instance.get_message("chat-input")
                if message is not None:
                    q = json.loads(message.content)
                    p = Process(target=self.reply_to_thing, args=(q,), daemon=True)
                    p.start()
                    self.message_broker_instance.delete_message("chat-input", message)
                    p.join()
            finally:
                time.sleep(MAT_PROC_SLEEP)

    def run(self):
        self.poll_for_message_worker_thread.start()

    def stop(self):
        sys.exit(0)


if __name__ == '__main__':
    procs = []
    for i in range(0, 6):
        proc = ProcessManager(f"ProcessManager-{i}").start()
        procs.append(proc)

    cleaner = QueueCleaner().start()
    procs.append(cleaner)

    try:
        while True:
            time.sleep(MAT_PROC_SLEEP)
    except KeyboardInterrupt:
        logging.info('Shutdown')
        map(lambda x: x.stop(), procs)
        exit(0)